# Multi-Business Management System

## Overview

The multi-business management system allows Enterprise Advantage tier users to create, manage, and switch between multiple businesses from a single dashboard. This feature is designed for business owners who operate multiple companies or want to manage different business units.

## Features

### 🏢 Business Management
- **Create Multiple Businesses**: Enterprise Advantage users can create unlimited businesses
- **Business Switching**: Seamlessly switch between different business contexts
- **Business Information**: Complete business profiles with contact details, legal information, and settings
- **Business Status**: Track active, inactive, or suspended business states

### 👥 Team Collaboration
- **Role-Based Access**: Owner, Admin, Manager, Employee, and Viewer roles
- **Business Invitations**: Invite team members to specific businesses
- **Permission Management**: Granular permissions for each business
- **Team Statistics**: Track team members and activity

### 🔐 Security & Access Control
- **Row Level Security (RLS)**: Database-level security policies
- **Tier-Based Access**: Only Enterprise Advantage users can create businesses
- **Business Context Switching**: Secure switching between business contexts
- **Audit Logging**: Track business switches and activities

## Database Schema

### Core Tables

#### `businesses`
Stores business information and settings:
```sql
- id (UUID, Primary Key)
- name (VARCHAR, Required)
- description (TEXT)
- business_type (VARCHAR, Required)
- industry (VARCHAR)
- contact_info (website, phone, email, address)
- legal_info (tax_id, registration_number)
- currency (VARCHAR, Default: USD)
- timezone (VARCHAR, Default: UTC)
- status (active, inactive, suspended)
- settings (JSONB)
- created_by (UUID, References auth.users)
```

#### `business_memberships`
Links users to businesses with roles:
```sql
- id (UUID, Primary Key)
- user_id (UUID, References auth.users)
- business_id (UUID, References businesses)
- role (owner, admin, manager, employee, viewer)
- permissions (JSONB)
- status (active, inactive, pending, suspended)
- invited_by (UUID, References auth.users)
- joined_at (TIMESTAMP)
```

#### `business_invitations`
Manages team invitations:
```sql
- id (UUID, Primary Key)
- business_id (UUID, References businesses)
- email (VARCHAR)
- role (VARCHAR)
- permissions (JSONB)
- status (pending, accepted, declined, expired)
- token (VARCHAR, Unique)
- expires_at (TIMESTAMP)
```

#### `business_switches`
Tracks business context switches:
```sql
- id (UUID, Primary Key)
- user_id (UUID, References auth.users)
- business_id (UUID, References businesses)
- switched_at (TIMESTAMP)
- ip_address (INET)
- user_agent (TEXT)
```

## API Services

### BusinessService (`src/services/businessService.ts`)

#### Core Methods
- `canCreateBusiness(userId)`: Check if user can create businesses
- `getUserBusinesses(userId)`: Get all businesses for a user
- `createBusiness(businessData, userId)`: Create a new business
- `getBusiness(businessId)`: Get business details
- `updateBusiness(businessId, updates)`: Update business information
- `deleteBusiness(businessId, userId)`: Delete business (owners only)

#### Team Management
- `createBusinessMembership(businessId, userId, role, permissions)`: Add team member
- `getBusinessMembers(businessId)`: Get all business members
- `inviteUserToBusiness(businessId, email, role, permissions, invitedBy)`: Send invitation
- `acceptBusinessInvitation(token, userId)`: Accept invitation

#### Context Switching
- `switchBusinessContext(businessId, userId)`: Switch business context
- `getBusinessStats(businessId)`: Get business statistics

## React Components

### BusinessRegistrationModal (`src/components/BusinessRegistrationModal.tsx`)
- **Purpose**: Modal for creating new businesses
- **Features**: 
  - Comprehensive business information form
  - Tier validation (Enterprise Advantage required)
  - Form validation and error handling
  - Business type and industry selection
  - Contact and legal information

### BusinessSwitcher (`src/components/BusinessSwitcher.tsx`)
- **Purpose**: Sidebar component for switching between businesses
- **Features**:
  - List all user businesses
  - Current business indicator
  - Quick business switching
  - Business statistics
  - Add new business button

### MultiBusinessDashboard (`src/components/MultiBusinessDashboard.tsx`)
- **Purpose**: Main dashboard for multi-business management
- **Features**:
  - Business switcher integration
  - Business-specific statistics
  - Recent activity tracking
  - Tabbed interface (Overview, Analytics, Team, Settings)

## Context Management

### BusinessContext (`src/contexts/BusinessContext.tsx`)
- **Purpose**: Global state management for business operations
- **State**:
  - `currentBusiness`: Currently selected business
  - `userBusinesses`: All user businesses
  - `loading`: Loading states
  - `canCreateBusiness`: Permission check
- **Methods**:
  - `switchBusiness(business)`: Switch business context
  - `refreshBusinesses()`: Reload user businesses

## Tier Integration

### Enterprise Advantage Features
- **Multi-Business Management**: Create unlimited businesses
- **Advanced Team Collaboration**: Role-based permissions
- **Business Analytics**: Per-business analytics and reporting
- **Multi-Branch Support**: Manage multiple business locations
- **Priority Support**: Dedicated support for enterprise users

### Feature Access Control
```typescript
// Check if user can create businesses
const canCreate = await businessService.canCreateBusiness(userId);

// Check tier features
const hasMultiBusiness = await tierService.hasFeatureAccess(userId, 'multi_business_management');
```

## Usage Examples

### Creating a New Business
```typescript
const businessData = {
  name: "My New Business",
  business_type: "retail",
  industry: "fashion",
  email: "contact@mybusiness.com",
  currency: "USD",
  timezone: "UTC"
};

const business = await businessService.createBusiness(businessData, userId);
```

### Switching Business Context
```typescript
const { switchBusiness } = useBusiness();
await switchBusiness(selectedBusiness);
```

### Inviting Team Members
```typescript
await businessService.inviteUserToBusiness(
  businessId,
  "team@example.com",
  "manager",
  { canEditProducts: true, canViewReports: true },
  currentUserId
);
```

## Security Considerations

### Row Level Security (RLS)
- Users can only access businesses they're members of
- Business owners have full control over their businesses
- Team members have role-based access
- Invitations are token-based with expiration

### Permission System
- **Owner**: Full control, can delete business
- **Admin**: Manage team, settings, and data
- **Manager**: Manage products, sales, and reports
- **Employee**: Basic operations (POS, inventory)
- **Viewer**: Read-only access

### Data Isolation
- Each business has isolated data
- Business context switching is tracked
- Audit logs for all business operations

## Future Enhancements

### Planned Features
- **Business Templates**: Pre-configured business setups
- **Cross-Business Analytics**: Compare performance across businesses
- **Business Groups**: Organize related businesses
- **Advanced Permissions**: Custom permission sets
- **Business API**: External integrations per business
- **Multi-Currency Support**: Different currencies per business
- **Business Backup**: Export/import business data

### Integration Points
- **POS System**: Business-specific POS configurations
- **Inventory Management**: Per-business inventory tracking
- **Analytics Dashboard**: Business-specific metrics
- **Team Management**: Role-based access to features
- **Billing System**: Per-business subscription management

## Getting Started

### 1. Database Setup
Run the SQL files in order:
```sql
-- 1. Create enums
01-create-enums.sql

-- 2. Create tables and data
02-create-tables-and-data.sql

-- 3. Create multi-business tables
03-multi-business-tables.sql
```

### 2. Component Integration
```tsx
// Wrap your app with BusinessProvider
<AuthProvider>
  <BusinessProvider>
    <App />
  </BusinessProvider>
</AuthProvider>

// Use in components
const { currentBusiness, switchBusiness, canCreateBusiness } = useBusiness();
```

### 3. Service Usage
```typescript
import { businessService } from '@/services/businessService';

// Check permissions
const canCreate = await businessService.canCreateBusiness(userId);

// Get user businesses
const businesses = await businessService.getUserBusinesses(userId);
```

This multi-business management system provides a comprehensive solution for Enterprise Advantage users to manage multiple businesses efficiently while maintaining security and proper access controls.
