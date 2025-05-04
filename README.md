# Get Local Friends - Angular App with AWS Amplify Gen 2

This application helps users find and connect with people in their local area, built with Angular and AWS Amplify Gen 2.

## Application Overview

Get Local Friends is a platform that allows users to:
- Create profiles with geospatial information
- Search for other users within a specified radius
- Connect based on proximity and shared interests

## Tech Stack

- **Frontend**: Angular 17
- **Backend**: AWS Amplify Gen 2
- **Authentication**: AWS Cognito
- **Database**: Amazon DynamoDB
- **Deployment**: AWS Amplify Hosting

## Architecture

```mermaid
graph TD
    A[Angular Frontend] -->|Auth| B[AWS Cognito]
    A -->|API Calls| C[AppSync GraphQL API]
    C -->|Resolvers| D[Lambda Functions]
    D -->|CRUD Operations| E[DynamoDB]
    
    subgraph "Authentication Flow"
        B -->|JWT Token| A
    end
    
    subgraph "Data Flow"
        D -->|find-nearby-users| E
        D -->|mutate-user-profile| E
        D -->|say-hello| A
    end
```

## API Endpoints

The application uses the following GraphQL API endpoints defined in `amplify/data/resource.ts`:

```mermaid
classDiagram
    class Queries {
        sayHello(name: String!): String
        findNearbyUsers(lat: Float!, lng: Float!, radius: Float!, nextToken: String): String
    }
    
    class Mutations {
        mutateUserProfile(action: String!, payload: String!): String
    }
    
    class Todo {
        content: String
        createdAt: DateTime
        updatedAt: DateTime
    }
    
    class UserProfile {
        userId: String!
        locationLat: Float!
        locationLng: Float!
        geohash: String!
        rangeKey: String!
        geoPrecision: Float
        lastUpdated: DateTime!
    }
    
    class Contact {
        email: String!
        name: String!
        summary: String!
        createdAt: DateTime!
        ipAddress: IpAddress!
    }
    
    Queries ..> Todo : operates on
    Queries ..> UserProfile : operates on
    Queries ..> Contact : operates on
    Mutations ..> Todo : modifies
    Mutations ..> UserProfile : modifies
    Mutations ..> Contact : modifies
```

### Query: `sayHello`
- **Description**: Simple greeting function that returns a personalized message
- **Arguments**: `{ name: string }` (required)
- **Returns**: `string`
- **Handler**: `sayHello` Lambda function
- **Authorization**: Public API key access
- **Usage Example**:
  ```graphql
  query {
    sayHello(name: "Alice")
  }
  ```
- **Response Example**:
  ```json
  {
    "data": {
      "sayHello": "Hello, Alice!"
    }
  }
  ```

### Query: `findNearbyUsers`
- **Description**: Searches for users within a specified radius based on geospatial data
- **Arguments**: 
  - `lat: float` (required) - Latitude coordinate
  - `lng: float` (required) - Longitude coordinate
  - `radius: float` (required) - Search radius in miles (1-5)
  - `nextToken: string` (optional) - Pagination token
- **Returns**: `string` (JSON string containing `nearbyUsers` array and `nextToken`)
- **Handler**: `findNearbyUsers` Lambda function
- **Authorization**: Allows both guest and authenticated users
- **Usage Example**:
  ```graphql
  query {
    findNearbyUsers(
      lat: 42.12345
      lng: -71.98765
      radius: 3
    )
  }
  ```
- **Response Example**:
  ```json
  {
    "data": {
      "findNearbyUsers": "{\"nearbyUsers\":[{\"userId\":\"user123\",\"locationLat\":42.12567,\"locationLng\":-71.98123,\"lastUpdated\":\"2025-05-01T14:30:22Z\"}],\"nextToken\":null}"
    }
  }
  ```

```mermaid
sequenceDiagram
    participant Client
    participant API as AppSync API
    participant Lambda as find-nearby-users Lambda
    participant DB as UserProfileTable
    
    Client->>API: findNearbyUsers(lat, lng, radius)
    API->>Lambda: Invoke with parameters
    Lambda->>Lambda: Calculate geohash precision (5-6 chars)
    Lambda->>DB: Query GSI using begins_with(geohash, :hash)
    DB->>Lambda: Return matching user profiles
    Lambda->>Lambda: Format response with nextToken
    Lambda->>API: Return formatted JSON string
    API->>Client: Return JSON string with users
```

### Mutation: `mutateUserProfile`
- **Description**: Creates, updates, or deletes user profile data with location information
- **Arguments**:
  - `action: string` (required) - One of: "create", "update", "delete"
  - `payload: string` (required) - JSON-encoded payload with profile data
- **Returns**: `string` (Success message)
- **Handler**: `mutateUserProfile` Lambda function
- **Authorization**: Authenticated users only
- **Payload Structure**:
  ```typescript
  // For create/update
  {
    userId: string;
    locationLat: number;
    locationLng: number;
  }
  
  // For delete
  {
    userId: string;
  }
  ```
- **Usage Example**:
  ```graphql
  mutation {
    mutateUserProfile(
      action: "create"
      payload: "{\"userId\":\"user123\",\"locationLat\":42.12567,\"locationLng\":-71.98123}"
    )
  }
  ```
- **Response Example**:
  ```json
  {
    "data": {
      "mutateUserProfile": "UserProfile for user123 created successfully."
    }
  }
  ```

```mermaid
sequenceDiagram
    participant Client
    participant API as AppSync API
    participant Lambda as mutate-user-profile Lambda
    participant DB as UserProfileTable
    
    Client->>API: mutateUserProfile(action, payload)
    API->>Lambda: Invoke with parameters
    Lambda->>Lambda: Parse JSON payload
    
    alt action == "create"
        Lambda->>Lambda: Generate geohash with precision 7
        Lambda->>Lambda: Create rangeKey (geohash#userId)
        Lambda->>DB: PutItem with ConditionExpression
    else action == "update"
        Lambda->>Lambda: Regenerate geohash
        Lambda->>Lambda: Update rangeKey (geohash#userId)
        Lambda->>DB: UpdateItem with new values
    else action == "delete"
        Lambda->>DB: DeleteItem by userId
    end
    
    DB->>Lambda: Confirm operation
    Lambda->>API: Return success message
    API->>Client: Return result
```

### Data Models

The application defines the following data models:

#### `Todo` Model
- Standard to-do item with content and timestamps
- Authorization: Owner-based access control

#### `UserProfile` Model
- Stores user location data with geospatial indexing
- Uses geohash for efficient proximity searches
- Has a secondary index on the `geohash` field
- Authorization: Owner-based access control

#### `Contact` Model
- Stores contact form submissions
- Captures IP address and timestamp
- Authorization: Allows submissions from guest, owner, and authenticated users

## Data Models

### UserProfile
```mermaid
classDiagram
    class UserProfile {
        userId: String!
        locationLat: Float!
        locationLng: Float!
        geohash: String!
        rangeKey: String!
        geoPrecision: Float
        lastUpdated: DateTime!
    }
```

### Contact
```mermaid
classDiagram
    class Contact {
        email: String!
        name: String!
        summary: String!
        createdAt: DateTime!
        ipAddress: IpAddress!
    }
```

## Geospatial Implementation

The application uses geohashing for efficient spatial queries:

```mermaid
graph TD
    A[User Location] -->|Encode| B[Geohash]
    B -->|Index| C[DynamoDB GSI]
    D[Search Query] -->|Calculate Area| E[Center Geohash]
    E -->|Prefix Query| C
    C -->|Filter Results| F[Nearby Users]
```

## Getting Started

### Prerequisites
- Node.js (^18.19.0 || >=20.5.0)
- AWS Account
- Angular CLI

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd get-local-friends
```

2. Install dependencies
```bash
npm install
```

3. Set up Amplify
```bash
npx ampx pipeline-deploy --branch <branch-name> --app-id <app-id>
```

4. Run the application locally
```bash
npm start
```

## Deployment

This application is deployed using AWS Amplify Hosting:

```bash
npm run build:prod
npx amplify publish
```

## Frontend Routes

```mermaid
graph TD
    A[/] --> B[HomeComponent]
    C[/contact-us] --> D[ContactUsComponent]
    E[/profile] --> F[ProfileComponent]
    G[/404] --> H[ErrorComponent]
    I[/login] --> J[LoginComponent]
    K[/sign-up] --> L[SignUpComponent]
    M[/search] --> N[SearchComponent]
    
    F -->|Auth Guard| O[Authenticated]
    L -->|Auth Guard| O
    N -->|Auth Guard| O
```

## Component Structure

```mermaid
graph TD
    A[AppComponent] --> B[HeaderComponent]
    A --> C[RouterOutlet]
    A --> D[FooterComponent]
    
    C --> E[HomeComponent]
    C --> F[ProfileComponent]
    C --> G[ContactUsComponent]
    C --> H[SearchComponent]
    C --> I[SignUpComponent]
    C --> J[LoginComponent]
    C --> K[ErrorComponent]
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant App as Angular App
    participant Auth as Cognito Auth
    participant API as AppSync API
    
    User->>App: Navigate to Login
    App->>Auth: Authenticate
    Auth->>App: Return tokens
    App->>API: Request with Auth token
    
    alt Not authenticated
        API->>App: Unauthorized error
        App->>User: Redirect to login
    else Authenticated
        API->>App: Return requested data
        App->>User: Display data
    end
```

## DynamoDB Design

The application uses a single-table design with GSIs for efficient queries:

```mermaid
graph TD
    subgraph "UserProfileTable"
        A[PK: userId] --> B[locationLat]
        A --> C[locationLng]
        A --> D[geohash]
        A --> E[rangeKey]
        A --> F[geoPrecision]
        A --> G[lastUpdated]
    end
    
    subgraph "GSI: GeohashIndex"
        H[PK: geohash] --> I[SK: rangeKey]
        H --> J[userId]
        H --> K[locationLat]
        H --> L[locationLng]
    end
    
    M[Query by geohash] --> H
```

## Onboarding Checklist for New Developers

1. **Environment Setup**
   - [ ] Install Node.js (^18.19.0 || >=20.5.0)
   - [ ] Install Angular CLI: `npm install -g @angular/cli`
   - [ ] Clone repository and install dependencies

2. **AWS Access**
   - [ ] Request AWS IAM user credentials
   - [ ] Configure AWS CLI: `aws configure`
   - [ ] Test Amplify access: `npx amplify status`

3. **Local Development**
   - [ ] Run application locally: `npm start`
   - [ ] Test authentication flow
   - [ ] Verify API connections

4. **Understanding the Codebase**
   - [ ] Review component structure
   - [ ] Understand Amplify Gen 2 data model
   - [ ] Learn about geospatial querying implementation

5. **Making Changes**
   - [ ] Create feature branch: `git checkout -b feature/[feature-name]`
   - [ ] Make local changes
   - [ ] Test locally
   - [ ] Submit PR for review

## Common Issues and Troubleshooting

- **Authentication Issues**: 
  - Verify Cognito user pool settings in Amplify configuration
  - Check browser console for token errors

- **API Errors**: 
  - Confirm IAM permissions for Lambda functions
  - Verify DynamoDB access patterns

- **Geospatial Query Problems**:
  - Check geohash precision settings
  - Verify GSI indexing on the geohash field

## Useful Commands

```bash
# Start local development server
npm start

# Run type checking
npm run typecheck

# Build for production
npm run build:prod

# Deploy backend changes
npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID

# Open Amplify Studio
npx amplify studio
```

## Project Structure

- `/amplify` - Amplify Gen 2 backend code
  - `/auth` - Authentication configuration
  - `/data` - Data models and GraphQL schema
  - `/functions` - Lambda function implementations
- `/src` - Angular application code
  - `/app` - Components and services
  - `/assets` - Static assets
  - `/environments` - Environment configuration

## Future Improvements

- Implement real-time notifications for nearby users
- Add chat functionality between connected users
- Enhance geospatial queries with more filtering options
- Add user profile customization features

## License

[MIT or appropriate license]

## Contact

For questions or assistance, contact the project maintainer.