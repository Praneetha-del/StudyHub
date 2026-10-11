package com.studyhub.security;

import com.studyhub.entity.User;
import com.studyhub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("🔍 loadUserByUsername called with: " + username);
        
        // ✅ Try by email first
        User user = userRepository.findByEmail(username).orElse(null);
        
        // ✅ Try by employee ID if not found
        if (user == null) {
            user = userRepository.findByEmployeeId(username).orElse(null);
        }
        
        // ✅ Try by roll number if not found
        if (user == null) {
            user = userRepository.findByRollNumber(username).orElse(null);
        }
        
        if (user == null) {
            System.err.println("❌ User not found for: " + username);
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
        
        System.out.println("✅ User found for authentication: " + user.getEmail());
        
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                getAuthorities(user)
        );
    }

    private Collection<? extends GrantedAuthority> getAuthorities(User user) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        if (user.getRole() != null) {
            authorities.add(new SimpleGrantedAuthority(user.getRole()));
        }
        return authorities;
    }
}