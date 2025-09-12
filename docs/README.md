# EMU Alerts Documentation

Welcome to the comprehensive documentation for the EMU Alerts emergency monitoring system. This documentation covers all aspects of the application including architecture, deployment, development, and maintenance.

## 📚 Documentation Index

### Getting Started
- **[Setup Guide](./SETUP.md)** - Complete developer setup instructions
- **[Architecture Overview](./ARCHITECTURE.md)** - System design and technical architecture

### Development
- **[Components Documentation](./COMPONENTS.md)** - Detailed component and hook documentation
- **[API Reference](./API.md)** - Cloud Functions and Firestore API documentation
- **[Dependencies Guide](./DEPENDENCIES.md)** - Complete dependency list and management

### Deployment & Operations
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment procedures
- **[Firebase Configuration](./FIREBASE.md)** - Firebase setup and security documentation

### Quick Links
- **[Main README](../README.md)** - Project overview and quick start
- **[App Status Report](../APP_STATUS_REPORT.md)** - Current application status

## 🚀 Quick Start

1. **Clone & Install**:
```bash
git clone https://github.com/ynotfins/emu-alerts.git
cd emu-alerts-expo
pnpm install
```

2. **Run the App**:
```bash
pnpm run web  # Recommended for development
```

3. **Test Login**:
```
Email: test-1757693595470@emu.com
Password: test123456
```

## 📖 Documentation Overview

### For Developers

Start with the **[Setup Guide](./SETUP.md)** to get your development environment ready. Then explore:

- **[Components](./COMPONENTS.md)** - Understanding the UI components and hooks
- **[Architecture](./ARCHITECTURE.md)** - How the system is designed
- **[API](./API.md)** - Working with the backend services

### For DevOps

Focus on deployment and operations:

- **[Deployment Guide](./DEPLOYMENT.md)** - Deploy to production
- **[Firebase Configuration](./FIREBASE.md)** - Security and backend setup
- **[Dependencies](./DEPENDENCIES.md)** - Package management

### For Project Managers

Key documents:

- **[Architecture Overview](./ARCHITECTURE.md)** - Technical overview
- **[App Status Report](../APP_STATUS_REPORT.md)** - Current status
- **[Main README](../README.md)** - Project summary

## 🏗️ Project Structure

```
emu-alerts-expo/
├── docs/                     # This documentation
│   ├── API.md               # API documentation
│   ├── ARCHITECTURE.md      # System architecture
│   ├── COMPONENTS.md        # Component reference
│   ├── DEPENDENCIES.md      # Dependency management
│   ├── DEPLOYMENT.md        # Deployment guide
│   ├── FIREBASE.md          # Firebase configuration
│   ├── README.md            # This file
│   └── SETUP.md             # Developer setup
├── src/                     # Application source code
│   ├── components/          # React components
│   ├── firebase/            # Firebase config
│   ├── hooks/               # Custom React hooks
│   ├── screens/             # Screen components
│   └── types/               # TypeScript types
├── functions/               # Cloud functions
├── android/                 # Android configuration
├── assets/                  # Images and assets
└── README.md               # Main project README
```

## 🔧 Technology Stack

- **Frontend**: React Native + Expo (v53)
- **Backend**: Firebase (Firestore, Auth, Functions)
- **Language**: TypeScript
- **Package Manager**: pnpm
- **Platforms**: iOS, Android, Web

## 📱 Application Features

1. **Real-time Alerts** - Live emergency notifications
2. **Authentication** - Secure user login
3. **Location Services** - Maps integration
4. **Search & Filter** - Find specific alerts
5. **Detailed Views** - Full incident information

## 🔐 Security Overview

- **Authentication**: Firebase Auth (Email/Password)
- **Database**: Firestore with security rules
- **API**: Cloud Functions with token authentication
- **Data**: Encrypted in transit and at rest

## 🚨 Support & Troubleshooting

### Common Issues

1. **Dependencies**: See [Setup Guide](./SETUP.md#troubleshooting)
2. **Deployment**: See [Deployment Guide](./DEPLOYMENT.md#troubleshooting)
3. **Firebase**: See [Firebase Docs](./FIREBASE.md#troubleshooting)

### Getting Help

1. Check the relevant documentation section
2. Review [GitHub Issues](https://github.com/ynotfins/emu-alerts/issues)
3. Contact the development team

## 📊 Current Status

- **Version**: 1.0.0
- **Status**: Production Ready
- **Last Updated**: January 2025
- **Test Account**: Available (see Quick Start)

## 🤝 Contributing

1. Read the [Setup Guide](./SETUP.md)
2. Follow the coding standards in [Components](./COMPONENTS.md)
3. Test thoroughly before submitting PRs
4. Update documentation as needed

## 📝 License

This project is private and proprietary for EMU emergency management use.

---

**Need help?** Start with the [Setup Guide](./SETUP.md) or check the specific documentation section for your needs.