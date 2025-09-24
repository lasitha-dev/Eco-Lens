# 🌱 Eco-Lens - Sustainable Shopping Assistant

A React Native mobile application that helps users make informed, sustainable shopping decisions with eco-friendly product ratings.

## Features

- **Welcome Screen**: Beautiful eco-friendly design with feature overview
- **User Authentication**: Complete sign-up and login system
- **Form Validation**: Comprehensive validation for all user inputs
- **MongoDB Integration**: Secure user data storage
- **Responsive Design**: Works on all screen sizes
- **Password Security**: Secure password hashing and validation

## Tech Stack

### Frontend
- React Native
- Expo
- React Navigation
- Responsive design with percentage-based layouts

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- bcryptjs for password hashing
- CORS enabled

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd eco-lens
```

### 2. Backend Setup

#### Install Backend Dependencies
```bash
cd backend
npm install
```

#### Environment Variables
Create a `.env` file in the backend directory:
```env
PORT=5002
MONGODB_URI=mongodb+srv://pramod:Pramod25@wijeboytechnology.rlmu075.mongodb.net/ecolens?retryWrites=true&w=majority&appName=Wijeboytechnology
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### Start Backend Server
```bash
npm start
# or for development with auto-restart
npm run dev
```

The backend will run on `http://localhost:5002`

### 3. Frontend Setup

#### Install Frontend Dependencies
```bash
# From the root directory
npm install
```

#### Start Expo Development Server
```bash
npm start
```

#### Run on Device/Simulator
- Scan QR code with Expo Go app (Android/iOS)
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Press `w` for web browser

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/check-email` - Check email availability

### Health Check
- `GET /api/health` - Server health status

### Users (Testing)
- `GET /api/users` - Get all users (password excluded)

## Form Validation Features

### Sign-Up Form
- **First Name**: Required, minimum 2 characters
- **Last Name**: Required, minimum 2 characters
- **Email**: Required, valid email format, unique in database
- **Address**: Required
- **Date of Birth**: Required, must be 18+ years old
- **Country**: Required, dropdown with all countries
- **Password**: 
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number
  - At least 1 special character
- **Confirm Password**: Must match password

### Real-time Validation
- Email uniqueness checked automatically
- Password strength indicators
- Real-time error feedback
- Form submission only when all validations pass

## Database Schema

### User Collection
```javascript
{
  firstName: String (required, min 2 chars),
  lastName: String (required, min 2 chars),
  email: String (required, unique, lowercase),
  address: String (required),
  dateOfBirth: Date (required),
  country: String (required),
  password: String (required, hashed),
  createdAt: Date (auto-generated)
}
```

## Security Features

- **Password Hashing**: bcryptjs with 12 salt rounds
- **Input Validation**: Server-side validation for all fields
- **Email Uniqueness**: Prevents duplicate registrations
- **Age Verification**: Ensures users are 18+
- **CORS Protection**: Configured for cross-origin requests

## Responsive Design

The app uses percentage-based layouts that adapt to different screen sizes:
- Font sizes: `Math.min(width * 0.08, 32)`
- Padding: `width * 0.06` for horizontal padding
- Margins: `height * 0.05` for vertical spacing

## Development Notes

### Backend API URL
The frontend is configured to connect to the API URL defined in the environment variable `API_URL`. For development, this should be set to `http://localhost:5002/api` in your `.env` file.

### MongoDB Connection
The app uses MongoDB Atlas. Ensure your IP address is whitelisted in the MongoDB Atlas dashboard.

### Testing
- Use the `/api/users` endpoint to view registered users
- Test email uniqueness with the `/api/check-email` endpoint
- Health check available at `/api/health`

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure backend server is running on port 5002
2. **MongoDB Connection Error**: Check your MongoDB Atlas connection string and IP whitelist
3. **Expo Go Issues**: Make sure your phone and computer are on the same WiFi network
4. **Validation Errors**: Check that all required fields are filled and meet validation criteria

### Debug Mode
- Backend logs are displayed in the terminal
- Frontend logs are available in Expo DevTools
- Use `console.log` for debugging API calls

## Future Enhancements

- JWT token authentication
- Password reset functionality
- Email verification
- Profile management
- Product sustainability ratings
- Barcode scanning
- Shopping history
- Sustainability goals tracking

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please create an issue in the repository or contact the development team.
