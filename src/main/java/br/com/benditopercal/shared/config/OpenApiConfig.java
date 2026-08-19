package br.com.benditopercal.shared.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI benditoPercalOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Bendito Percal — API de Gestão")
                        .description("Sistema de gestão de estoque para enxovais de hotelaria")
                        .version("v1"))
                .components(new Components()
                        .addSecuritySchemes("sessionAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.COOKIE)
                                        .name("JSESSIONID")))
                .security(List.of(new SecurityRequirement().addList("sessionAuth")));
    }
}