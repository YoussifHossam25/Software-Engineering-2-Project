package com.ecommerce.order.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Around("execution(* com.ecommerce.order.controller..*(..))")
    public Object logController(ProceedingJoinPoint pjp) throws Throwable {
        log.info("→ {}.{}()", pjp.getSignature().getDeclaringTypeName(), pjp.getSignature().getName());
        long start = System.currentTimeMillis();
        try {
            Object result = pjp.proceed();
            log.info("← {}.{}() completed in {}ms", pjp.getSignature().getDeclaringTypeName(),
                    pjp.getSignature().getName(), System.currentTimeMillis() - start);
            return result;
        } catch (Throwable t) {
            log.error("✗ {}.{}() threw {}: {}", pjp.getSignature().getDeclaringTypeName(),
                    pjp.getSignature().getName(), t.getClass().getSimpleName(), t.getMessage());
            throw t;
        }
    }

    @Around("execution(* com.ecommerce.order.service..*(..))")
    public Object logService(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = pjp.proceed();
        long elapsed = System.currentTimeMillis() - start;
        if (elapsed > 1000) {
            log.warn("SLOW: {}.{}() took {}ms", pjp.getSignature().getDeclaringTypeName(),
                    pjp.getSignature().getName(), elapsed);
        }
        return result;
    }
}
