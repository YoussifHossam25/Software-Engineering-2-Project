package com.ecommerce.product.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Around("execution(* com.ecommerce.product.controller..*(..))")
    public Object logController(ProceedingJoinPoint pjp) throws Throwable {
        String method = pjp.getSignature().toShortString();
        log.info("→ [PRODUCT-CONTROLLER] {}", method);
        long start = System.currentTimeMillis();
        try {
            Object result = pjp.proceed();
            log.info("← [PRODUCT-CONTROLLER] {} | {}ms", method, System.currentTimeMillis() - start);
            return result;
        } catch (Exception ex) {
            log.error("✗ [PRODUCT-CONTROLLER] {} | {}", method, ex.getMessage());
            throw ex;
        }
    }

    @Around("execution(* com.ecommerce.product.service..*(..))")
    public Object logService(ProceedingJoinPoint pjp) throws Throwable {
        String method = pjp.getSignature().toShortString();
        long start = System.currentTimeMillis();
        Object result = pjp.proceed();
        log.info("⚙ [PRODUCT-SERVICE] {} | {}ms", method, System.currentTimeMillis() - start);
        return result;
    }

    @AfterThrowing(pointcut = "execution(* com.ecommerce.product..*(..))", throwing = "ex")
    public void logException(JoinPoint jp, Exception ex) {
        log.error("✗ [PRODUCT-EXCEPTION] {} | {}: {}",
                jp.getSignature().toShortString(), ex.getClass().getSimpleName(), ex.getMessage());
    }
}
