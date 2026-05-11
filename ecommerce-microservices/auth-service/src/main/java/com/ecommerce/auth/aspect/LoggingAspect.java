package com.ecommerce.auth.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Around("execution(* com.ecommerce.auth.controller..*(..))")
    public Object logController(ProceedingJoinPoint pjp) throws Throwable {
        String method = pjp.getSignature().toShortString();
        log.info("→ [AUTH-CONTROLLER] {} | args={}", method, sanitizeArgs(pjp.getArgs()));
        long start = System.currentTimeMillis();
        try {
            Object result = pjp.proceed();
            log.info("← [AUTH-CONTROLLER] {} | time={}ms", method, System.currentTimeMillis() - start);
            return result;
        } catch (Exception ex) {
            log.error("✗ [AUTH-CONTROLLER] {} | error={}", method, ex.getMessage());
            throw ex;
        }
    }

    @Around("execution(* com.ecommerce.auth.service..*(..))")
    public Object logService(ProceedingJoinPoint pjp) throws Throwable {
        String method = pjp.getSignature().toShortString();
        long start = System.currentTimeMillis();
        Object result = pjp.proceed();
        log.info("⚙ [AUTH-SERVICE] {} | time={}ms", method, System.currentTimeMillis() - start);
        return result;
    }

    @AfterThrowing(pointcut = "execution(* com.ecommerce.auth..*(..))", throwing = "ex")
    public void logException(JoinPoint jp, Exception ex) {
        log.error("✗ [AUTH-EXCEPTION] {} | {}: {}",
                jp.getSignature().toShortString(),
                ex.getClass().getSimpleName(),
                ex.getMessage());
    }

    private String sanitizeArgs(Object[] args) {
        return Arrays.stream(args)
                .map(arg -> {
                    if (arg == null) return "null";
                    String str = arg.toString();
                    if (str.toLowerCase().contains("password")) return "[REDACTED]";
                    return str;
                })
                .collect(java.util.stream.Collectors.joining(", ", "[", "]"));
    }
}
