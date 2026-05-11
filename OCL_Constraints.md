# OCL Constraints — NexCart E-Commerce System

Object Constraint Language (OCL) constraints for all core entities in the microservices system.

---

## 1. Product

```ocl
context Product

-- Price must be positive
inv validPrice:
    self.price > 0

-- Stock quantity cannot be negative
inv validStock:
    self.stockQuantity >= 0

-- SKU must not be empty
inv validSku:
    self.sku <> null and self.sku.size() > 0

-- Name must not be empty
inv validName:
    self.name <> null and self.name.size() > 0

-- Out-of-stock flag must be consistent with quantity
inv outOfStockConsistency:
    self.stockQuantity = 0 implies self.outOfStock = true

-- An active product must have a positive price
inv activeProductHasPrice:
    self.active = true implies self.price > 0

-- An inactive product cannot be ordered
inv inactiveNotOrderable:
    self.active = false implies
        Order.allInstances()->forAll(o |
            o.items->forAll(i | i.productId <> self.id))
```

```ocl
context Product::deductStock(qty : Integer) : Product
-- Cannot deduct more than available stock
pre sufficientStock:
    self.stockQuantity >= qty

-- qty must be positive
pre positiveQty:
    qty > 0

-- Stock is reduced by exactly qty
post stockReduced:
    self.stockQuantity = self.stockQuantity@pre - qty

context Product::restoreStock(qty : Integer) : Product
-- qty must be positive
pre positiveQty:
    qty > 0

-- Stock is increased by exactly qty
post stockRestored:
    self.stockQuantity = self.stockQuantity@pre + qty
```

---

## 2. Order

```ocl
context Order

-- Order must have at least one item
inv hasItems:
    self.items->size() > 0

-- Order number must follow the ORD- prefix format
inv validOrderNumber:
    self.orderNumber.startsWith('ORD-')

-- Total amount must be non-negative
inv validTotal:
    self.totalAmount >= 0

-- Subtotal must be non-negative
inv validSubtotal:
    self.subtotal >= 0

-- Total = subtotal + tax + shippingCost
inv totalConsistency:
    self.totalAmount = self.subtotal + self.tax + self.shippingCost

-- Customer email must not be empty
inv validCustomerEmail:
    self.customerEmail <> null and self.customerEmail.size() > 0

-- Shipping address must not be empty
inv validShippingAddress:
    self.shippingAddress <> null and self.shippingAddress.size() > 0

-- A cancelled order cannot transition to any other status
inv cancelledIsFinal:
    self.status = OrderStatus::CANCELLED implies
        self.status = OrderStatus::CANCELLED

-- Subtotal equals the sum of all item total prices
inv subtotalMatchesItems:
    self.subtotal =
        self.items->iterate(i; sum : Real = 0 | sum + i.totalPrice)
```

```ocl
context Order::createOrder(
    items     : Set(OrderItemRequest),
    address   : String,
    customerId: Long) : Order

-- Must have at least one item
pre nonEmptyItems:
    items->size() > 0

-- Shipping address must be provided
pre validAddress:
    address <> null and address.size() > 0

-- All requested products must be active and in stock
pre productsAvailable:
    items->forAll(i |
        Product.allInstances()
            ->select(p | p.id = i.productId and p.active = true)
            ->first().stockQuantity >= i.quantity)

-- New order starts as PENDING
post isPending:
    result.status = OrderStatus::PENDING

-- Stock is deducted for each item
post stockDeducted:
    items->forAll(i |
        Product.allInstances()
            ->select(p | p.id = i.productId)
            ->first().stockQuantity =
        Product.allInstances()
            ->select(p | p.id = i.productId)
            ->first().stockQuantity@pre - i.quantity)


context Order::cancelOrder() : Order

-- Only PENDING orders can be cancelled
pre isPending:
    self.status = OrderStatus::PENDING

-- Status becomes CANCELLED
post isCancelled:
    self.status = OrderStatus::CANCELLED

-- Stock is restored for all items
post stockRestored:
    self.items->forAll(i |
        Product.allInstances()
            ->select(p | p.id = i.productId)
            ->first().stockQuantity =
        Product.allInstances()
            ->select(p | p.id = i.productId)
            ->first().stockQuantity@pre + i.quantity)
```

---

## 3. OrderItem

```ocl
context OrderItem

-- Quantity must be at least 1
inv validQuantity:
    self.quantity >= 1

-- Unit price must be positive
inv validUnitPrice:
    self.unitPrice > 0

-- Total price must equal unit price × quantity
inv totalPriceConsistency:
    self.totalPrice = self.unitPrice * self.quantity

-- Must belong to an order
inv hasOrder:
    self.order <> null

-- Product name and SKU must not be empty
inv validProductInfo:
    self.productName <> null and self.productName.size() > 0 and
    self.productSku  <> null and self.productSku.size()  > 0
```

---

## 4. Delivery

```ocl
context Delivery

-- Delivery number must follow the DEL- prefix format
inv validDeliveryNumber:
    self.deliveryNumber.startsWith('DEL-')

-- One delivery per order
inv uniquePerOrder:
    Delivery.allInstances()
        ->isUnique(d | d.orderId)

-- A SHIPPED delivery must have a driver assigned
inv shippedHasDriver:
    self.status = DeliveryStatus::SHIPPED implies
        self.driverId <> null

-- An ARRIVED delivery must have been SHIPPED first
inv arrivedAfterShipped:
    self.status = DeliveryStatus::ARRIVED implies
        self.status@pre = DeliveryStatus::SHIPPED

-- Delivery address must not be empty
inv validAddress:
    self.deliveryAddress <> null and self.deliveryAddress.size() > 0
```

```ocl
context Delivery::pickOrder(driverId : Long) : Delivery

-- Delivery must be PENDING (no driver yet)
pre isPending:
    self.status = DeliveryStatus::PENDING

-- No driver assigned yet
pre noDriver:
    self.driverId = null

-- Status becomes SHIPPED after pick
post isShipped:
    self.status = DeliveryStatus::SHIPPED

-- Driver is assigned
post driverAssigned:
    self.driverId = driverId


context Delivery::markArrived() : Delivery

-- Must be in SHIPPED state
pre isShipped:
    self.status = DeliveryStatus::SHIPPED

-- Status becomes ARRIVED
post isArrived:
    self.status = DeliveryStatus::ARRIVED
```

---

## 5. User / Authentication

```ocl
context User

-- Email must contain '@'
inv validEmail:
    self.email <> null and
    self.email.indexOf('@') > 0 and
    self.email.indexOf('.') > self.email.indexOf('@')

-- Role must be one of the allowed values
inv validRole:
    Set{'ADMIN', 'MANAGER', 'CUSTOMER', 'DELIVERY'}
        ->includes(self.role)

-- Each email must be unique across all users
inv uniqueEmail:
    User.allInstances()->isUnique(u | u.email)

-- Name must not be empty
inv validName:
    self.name <> null and self.name.size() > 0
```

```ocl
context AuthService::login(email : String, password : String) : AuthResponse

-- Email and password must be provided
pre validCredentials:
    email <> null and email.size() > 0 and
    password <> null and password.size() > 0

-- Returned token must not be empty
post tokenGenerated:
    result.token <> null and result.token.size() > 0

-- Returned role matches the user's role
post correctRole:
    result.role =
        User.allInstances()
            ->select(u | u.email = email)
            ->first().role


context AuthService::register(
    name    : String,
    email   : String,
    password: String,
    role    : String) : AuthResponse

-- Email must not already exist
pre emailNotTaken:
    User.allInstances()->forAll(u | u.email <> email)

-- A new user account is created
post userCreated:
    User.allInstances()
        ->exists(u | u.email = email and u.role = role)
```

---

## Summary Table

| Entity | Invariants | Preconditions | Postconditions |
|--------|-----------|---------------|----------------|
| Product | 7 | 2 | 2 |
| Order | 8 | 3 | 4 |
| OrderItem | 5 | — | — |
| Delivery | 5 | 4 | 4 |
| User/Auth | 4 | 3 | 4 |
| **Total** | **29** | **12** | **14** |
