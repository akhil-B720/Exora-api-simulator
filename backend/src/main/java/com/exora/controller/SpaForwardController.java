package com.exora.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {

    @GetMapping(value = {
        "/",
        "/overview",
        "/endpoints",
        "/endpoints/**",
        "/requests",
        "/requests/**",
        "/api-tester",
        "/settings"
    })
    public String forwardSpaRoutes() {
        return "forward:/index.html";
    }
}
