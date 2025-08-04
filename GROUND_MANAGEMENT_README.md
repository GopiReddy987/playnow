# Ground Management System

This document describes the implementation of the ground management system for the PlayNow application, allowing admins to upload grounds with pricing and timing availability that automatically reflects in the frontend for user booking.

## Features Implemented

### Backend (ASP.NET Core)

1. **TurfTiming Model** (`Models/TurfTiming.cs`)
   - Tracks availability for each day of the week
   - Configurable start/end times
   - Individual pricing per time slot
   - Availability status

2. **Enhanced Turf Model** (`Models/Turf.cs`)
   - Added navigation property for TurfTimings
   - Comprehensive ground information
   - Pricing and capacity management

3. **Turf DTOs** (`DTOs/TurfDTOs.cs`)
   - CreateTurfRequest: For adding new grounds
   - UpdateTurfRequest: For modifying existing grounds
   - TurfDetailResponse: Complete ground information
   - Timing and amenity request/response models

4. **TurfService** (`Services/TurfService.cs`)
   - CRUD operations for turfs
   - Timing and amenity management
   - Filtering by sport type and city
   - Data mapping and validation

5. **TurfController** (`Controllers/TurfController.cs`)
   - RESTful API endpoints
   - Admin-only operations for create/update/delete
   - Public endpoints for viewing grounds
   - Error handling and validation

### Frontend (Angular)

1. **Enhanced Ground Management Component** (`features/admin/ground-management/`)
   - Comprehensive form for adding/editing grounds
   - Dynamic timing configuration (day, start time, end time, price)
   - Amenity management with additional costs
   - Real-time form validation
   - Image upload support
   - Responsive design

2. **Turf Service** (`core/services/turf.service.ts`)
   - Centralized turf data management
   - Reactive state management with Angular signals
   - API integration for all turf operations
   - Error handling and loading states
   - Utility methods for pricing and slot calculation

3. **Enhanced Booking Components**
   - **Book Turf Component**: Displays grounds with pricing, amenities, and timing
   - **Ground Booking Component**: Detailed booking form with real-time slot availability
   - Dynamic pricing calculation
   - Amenity cost inclusion
   - Date-based slot generation

## API Endpoints

### Public Endpoints
- `GET /api/turf` - Get all available turfs
- `GET /api/turf/{id}` - Get specific turf details
- `GET /api/turf/sport/{sportType}` - Get turfs by sport type
- `GET /api/turf/city/{city}` - Get turfs by city

### Admin Endpoints (Require Admin Role)
- `POST /api/turf` - Create new turf
- `PUT /api/turf/{id}` - Update existing turf
- `DELETE /api/turf/{id}` - Delete turf

## Database Schema

### TurfTiming Table
```sql
CREATE TABLE TurfTimings (
    Id INT PRIMARY KEY IDENTITY(1,1),
    TurfId INT NOT NULL,
    DayOfWeek INT NOT NULL, -- 0=Sunday, 1=Monday, etc.
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    PricePerHour DECIMAL(18,2) NOT NULL,
    IsAvailable BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2 NOT NULL,
    FOREIGN KEY (TurfId) REFERENCES Turfs(Id) ON DELETE CASCADE
);
```

## Usage Flow

### Admin Flow
1. Navigate to `/admin/ground-management`
2. Fill out the comprehensive form including:
   - Basic information (name, description, address, etc.)
   - Sport type and capacity
   - Base pricing
   - Timing configuration for each day
   - Amenities with additional costs
3. Save the ground
4. Ground automatically appears in the user booking interface

### User Flow
1. Navigate to `/book-turf`
2. Browse available grounds with pricing and amenities
3. Filter by sport type
4. Click "Book Now" on desired ground
5. Select date and time slots (automatically generated based on admin configuration)
6. View real-time pricing calculation
7. Complete booking

## Key Features

### Dynamic Pricing
- Base price per hour configurable per ground
- Different pricing for different days (e.g., weekend rates)
- Additional costs for amenities
- Real-time total calculation

### Flexible Timing
- Configurable availability for each day of the week
- Custom start and end times
- Automatic slot generation (2-hour slots by default)
- Availability status per time slot

### Amenity Management
- Add/remove amenities per ground
- Optional additional costs
- Availability status
- Description and details

### Real-time Updates
- Changes in admin panel immediately reflect in user interface
- Automatic slot availability based on configured timings
- Dynamic pricing calculation
- Responsive design for mobile and desktop

## Technical Implementation

### State Management
- Angular signals for reactive state management
- Centralized turf service for data operations
- Optimistic updates for better UX
- Error handling and loading states

### Form Management
- Reactive forms with comprehensive validation
- Dynamic form arrays for timings and amenities
- Real-time validation feedback
- Form state persistence

### API Integration
- RESTful API design
- Proper error handling and status codes
- Authentication and authorization
- CORS configuration for frontend integration

## Future Enhancements

1. **Advanced Booking Features**
   - Recurring bookings
   - Group bookings
   - Special event pricing

2. **Analytics and Reporting**
   - Booking analytics
   - Revenue reports
   - Popular time slots

3. **Integration Features**
   - Payment gateway integration
   - SMS/email notifications
   - Calendar integration

4. **Mobile App**
   - Native mobile application
   - Push notifications
   - Offline booking

## Setup Instructions

1. **Backend Setup**
   ```bash
   cd playnow/playnow-backend
   dotnet restore
   dotnet ef database update
   dotnet run
   ```

2. **Frontend Setup**
   ```bash
   cd playnow/playnow-frontend
   npm install
   ng serve
   ```

3. **Database Migration**
   - The system includes a migration for the TurfTiming entity
   - Run `dotnet ef database update` to apply migrations

## Security Considerations

- Admin endpoints require authentication and admin role
- Input validation on both frontend and backend
- SQL injection protection through Entity Framework
- XSS protection through Angular's built-in sanitization
- CORS configuration for secure cross-origin requests

This implementation provides a complete ground management system that allows admins to efficiently manage grounds while providing users with a seamless booking experience. 