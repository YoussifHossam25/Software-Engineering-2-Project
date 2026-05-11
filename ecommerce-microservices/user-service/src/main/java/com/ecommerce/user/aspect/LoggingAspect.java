package com.ecommerce.user.aspect;

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

    @Around("execution(* com.ecommerce.user.controller..*(..))")
    public Object logController(ProceedingJoinPoint pjp) throws Throwable {
        String method = pjp.getSignature().toShortString();
        long start = System.currentTimeMillis();
        try {
            Object result = pjp.proceed();
            log.info("← [USER-CONTROLLER] {} | {}ms", method, System.currentTimeMillis() - start);
            return result;
        } catch (Exception ex) {
            log.error("✗ [USER-CONTROLLER] {} | {}", method, ex.getMessage());
            throw ex;
        }
    }

    @Around("execution(* com.ecommerce.user.service..*(..))")
    public Object logService(ProceedingJoinPoint pjp) throws Throwable {
        String method = pjp.getSignature().toShortString();
        long start = System.currentTimeMillis();
        Object result = pjp.proceed();
        log.info("⚙ [USER-SERVICE] {} | {}ms", method, System.currentTimeMillis() - start);
        return result;
    }

    @AfterThrowing(pointcut = "execution(* com.ecommerce.user..*(..))", throwing = "ex")
    public void logException(JoinPoint jp, Exception ex) {
        log.error("✗ [USER-EXCEPTION] {} | {}: {}", jp.getSignature().toShortString(),
                ex.getClass().getSimpleName(), ex.getMessage());
    }
}
