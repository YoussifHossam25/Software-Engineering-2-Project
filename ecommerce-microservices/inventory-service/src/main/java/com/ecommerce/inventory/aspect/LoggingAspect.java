package com.ecommerce.inventory.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect @Component @Slf4j
public class LoggingAspect {

    @Around("execution(* com.ecommerce.inventory.controller..*(..))")
    public Object logController(ProceedingJoinPoint pjp) throws Throwable {
        String m = pjp.getSignature().toShortString();
        long t = System.currentTimeMillis();
        try { Object r = pjp.proceed(); log.info("← [INV-CTRL] {} | {}ms", m, System.currentTimeMillis()-t); return r; }
        catch (Exception ex) { log.error("✗ [INV-CTRL] {} | {}", m, ex.getMessage()); throw ex; }
    }

    @Around("execution(* com.ecommerce.inventory.service..*(..))")
    public Object logService(ProceedingJoinPoint pjp) throws Throwable {
        String m = pjp.getSignature().toShortString();
        long t = System.currentTimeMillis();
        Object r = pjp.proceed();
        log.info("⚙ [INV-SVC] {} | {}ms", m, System.currentTimeMillis()-t);
        return r;
    }

    @AfterThrowing(pointcut = "execution(* com.ecommerce.inventory..*(..))", throwing = "ex")
    public void logException(JoinPoint jp, Exception ex) {
        log.error("✗ [INV-EX] {} | {}: {}", jp.getSignature().toShortString(), ex.getClass().getSimpleName(), ex.getMessage());
    }
}
