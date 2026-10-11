import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // ✅ Get user role (handle both formats)
  const userRole = user?.role || '';
  console.log('🔍 RoleBasedRoute - User role:', userRole);
  console.log('🔍 Allowed roles:', allowedRoles);

  // ✅ Check if user has any of the allowed roles
  const hasAllowedRole = allowedRoles.some(role => {
    // Check exact match or match without ROLE_ prefix
    return userRole === role || 
           userRole === role.replace('ROLE_', '') ||
           userRole.replace('ROLE_', '') === role;
  });

  if (allowedRoles.length > 0 && !hasAllowedRole) {
    console.log('❌ User does not have required role. Redirecting to unauthorized.');
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleBasedRoute;