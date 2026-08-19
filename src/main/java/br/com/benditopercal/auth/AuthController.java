package br.com.benditopercal.auth;

import br.com.benditopercal.auth.dto.LoginRequest;
import br.com.benditopercal.auth.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Autenticação", description = "Login, logout e usuário autenticado, via sessão (cookie)")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
    }

    @Operation(
            summary = "Login",
            description = "Autentica o usuário e cria uma sessão. O cookie JSESSIONID retornado deve ser enviado nas requisições seguintes."
    )
    @SecurityRequirements
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login realizado, sessão criada"),
            @ApiResponse(responseCode = "401", description = "E-mail ou senha inválidos, ou usuário inativo")
    })
    @PostMapping("/login")
    public UserResponse login(@Valid @RequestBody LoginRequest request,
                              HttpServletRequest httpRequest,
                              HttpServletResponse httpResponse) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);

        User user = userRepository.findByEmailIgnoreCase(request.email()).orElseThrow();
        return UserResponse.from(user);
    }

    @Operation(summary = "Logout", description = "Invalida a sessão atual.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Sessão encerrada"),
            @ApiResponse(responseCode = "401", description = "Não autenticado")
    })
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        request.getSession().invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Usuário autenticado", description = "Retorna os dados do usuário da sessão atual.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dados do usuário"),
            @ApiResponse(responseCode = "401", description = "Não autenticado")
    })
    @GetMapping("/me")
    public UserResponse me() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        return UserResponse.from(user);
    }
}