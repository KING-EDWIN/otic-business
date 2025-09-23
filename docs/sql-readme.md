# OTIC Business SQL Files

This directory contains all SQL files for the OTIC Business project, organized by functionality.

## Directory Structure

```
sql/
├── README.md                           # This file
├── complete-database-setup.sql         # Complete database setup script
├── database-setup/                     # Core database schema files
│   ├── core-schema.sql                # Main business tables
│   ├── otic-vision-schema.sql         # OTIC Vision (VFT) tables
│   ├── admin-system-schema.sql        # Admin and system management
│   ├── multi-business-schema.sql      # Multi-business branch system
│   ├── faq-system-schema.sql         # FAQ and support system
│   └── diagnostics/                   # Database diagnostic scripts
│       ├── 01-check-all-tables.sql
│       ├── 02-check-user-profiles-structure.sql
│       ├── 03-check-businesses-structure.sql
│       ├── 04-check-rpc-functions.sql
│       ├── 05-check-rls-policies.sql
│       ├── 06-check-all-tables-columns.sql
│       ├── 07-check-foreign-keys.sql
│       └── 08-check-indexes.sql
├── rpc-functions/                      # Remote Procedure Call functions
│   └── admin-functions.sql            # Admin portal functions
└── rls-scripts/                        # Row Level Security scripts
    └── rls-policies.sql               # RLS policies for all tables
```

## Usage

### Complete Setup
To set up the entire database from scratch:
```sql
\i sql/complete-database-setup.sql
```

### Individual Components
To set up specific parts of the database:

1. **Core Schema**: `\i sql/database-setup/core-schema.sql`
2. **OTIC Vision**: `\i sql/database-setup/otic-vision-schema.sql`
3. **Admin System**: `\i sql/database-setup/admin-system-schema.sql`
4. **Multi-Business**: `\i sql/database-setup/multi-business-schema.sql`
5. **FAQ System**: `\i sql/database-setup/faq-system-schema.sql`
6. **Admin Functions**: `\i sql/rpc-functions/admin-functions.sql`
7. **RLS Policies**: `\i sql/rls-scripts/rls-policies.sql`

### Diagnostics
To check database structure:
```sql
\i sql/database-setup/diagnostics/01-check-all-tables.sql
-- Run other diagnostic scripts as needed
```

## Key Features

### Core Business System
- User profiles and authentication
- Individual and business signups
- Multi-level business structure
- Business memberships and invitations
- Access permissions system

### OTIC Vision (Visual Fingerprinting Technology)
- Visual filter tags and categories
- Product visual fingerprints
- Object detection and recognition
- Visual scan history and analytics
- AI-powered insights and predictions

### Multi-Business Branch System
- Branch locations and management
- Branch-specific inventory
- Staff management and attendance
- Branch analytics and reporting
- Inter-branch transfers

### Payment Integration
- Flutterwave payment processing
- Payment transactions and history
- Subscription management
- Invoice generation and tracking

### Admin System
- Admin user management
- System error logging
- Business insights and KPIs
- Performance metrics and reporting

### FAQ and Support
- Categorized FAQ system
- Search functionality
- Tier-based access control
- User support tracking

## Database Schema Overview

The database is designed to support:
- **Individual Users**: Freelancers and individual professionals
- **Business Users**: Companies with multiple branches and staff
- **Multi-tenancy**: Secure data isolation between users
- **Scalability**: Optimized indexes and efficient queries
- **Security**: Row Level Security (RLS) policies
- **Analytics**: Comprehensive reporting and insights

## Security

All tables have Row Level Security (RLS) enabled with appropriate policies:
- Users can only access their own data
- Business owners can manage their business data
- Admin functions bypass RLS for system management
- Secure admin functions with `SECURITY DEFINER`

## Maintenance

### Regular Tasks
1. Run diagnostic scripts to check database health
2. Monitor system error logs
3. Update RLS policies as needed
4. Optimize queries based on usage patterns

### Backup Strategy
- Regular automated backups
- Test restore procedures
- Monitor database size and performance

## Support

For database-related issues:
1. Check system error logs
2. Run diagnostic scripts
3. Review RLS policies
4. Check admin function permissions

## Version History

- **v1.0**: Initial database schema
- **v1.1**: Added OTIC Vision system
- **v1.2**: Added multi-business branch system
- **v1.3**: Added FAQ and support system
- **v1.4**: Enhanced admin functions and RLS policies