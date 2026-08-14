package com.techcareer.apigateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

	@Bean
	public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity serverHttpSecurity) {
		serverHttpSecurity.csrf(csrf -> csrf.disable()
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.authorizeExchange(
						// Path matchers here have no /api prefix - see
						// application.properties for why the gateway's routes were
						// changed to match what the frontend actually calls.
						exchange -> exchange.pathMatchers("/eureka/**").permitAll()
								// Kubelet's httpGet probes hit these with no
								// Authorization header - without this, startup/liveness/
								// readiness all fail with 401 and the pod never goes Ready.
								.pathMatchers("/actuator/**").permitAll()
								.pathMatchers("/swagger-ui/**").permitAll()
								.pathMatchers("/v3/api-docs/**").permitAll()
								.pathMatchers("/user/signin").permitAll()
								.pathMatchers("/user/signup").permitAll()
								// Public product catalog - the storefront home page
								// lists products for anonymous visitors, before login.
								.pathMatchers(HttpMethod.GET, "/product/**").permitAll()
								.anyExchange().authenticated())
				.oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults())));
		return serverHttpSecurity.build();
	}

	private CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.applyPermitDefaultValues();

		configuration.addAllowedMethod(HttpMethod.GET);
		configuration.addAllowedMethod(HttpMethod.POST);
		configuration.addAllowedMethod(HttpMethod.DELETE);
		configuration.addAllowedMethod(HttpMethod.PUT);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);

		return source;
	}
}