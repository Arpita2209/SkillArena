package com.skillarena.Springboot.Security;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
@Service
public class JwtService {
 @Value("${app.jwt.secret}") private String secret;
 @Value("${app.jwt.expiration-ms:86400000}") private long expiration;
 private SecretKey key(){byte[] bytes=secret.getBytes(java.nio.charset.StandardCharsets.UTF_8); if(bytes.length<32) throw new IllegalStateException("app.jwt.secret must be at least 32 bytes"); return Keys.hmacShaKeyFor(bytes);}
 public String generateToken(String email){long now=System.currentTimeMillis();return Jwts.builder().subject(email).issuedAt(new Date(now)).expiration(new Date(now+expiration)).signWith(key()).compact();}
 public String extractEmail(String token){return claims(token).getSubject();}
 private Claims claims(String token){return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload();}
 public boolean isTokenValid(String token,String email){try{return email.equalsIgnoreCase(extractEmail(token));}catch(Exception ex){return false;}}
}
