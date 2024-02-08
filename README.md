# EDU-Venture Server

Welcome to EDU-Venture Server, the backend component of EDU-Venture, a comprehensive study abroad website offering consultant services and courses for students interested in studying abroad. This repository houses the server-side codebase responsible for handling data management, user authentication, and facilitating communication features such as live chat.

## Features

- **User Authentication:** Utilizes JSON Web Tokens (JWT) for secure user authentication, ensuring that only authorized users can access protected endpoints.
- **Consultant Services:** Provides a platform for multiple consultants to offer their services, including personalized consultations and course recommendations for students.
- **Courses:** Offers a wide range of courses for students interested in studying abroad, covering various subjects and academic levels.
- **Live Chat:** Enables real-time communication between students and consultants, supporting text messages, video messages, photos, audio recordings, and file sharing.
- **Search, Sort, and Filter:** Allows users to easily search for consultants and courses, sorting and filtering results based on different criteria to find the most relevant information.

## Technologies Used

- **MongoDB:** A flexible and scalable NoSQL database used for storing user data, consultant information, course details, and chat messages.
- **Express.js:** A minimalist web framework for Node.js used to build the RESTful API endpoints, handle HTTP requests, and manage routing.
- **Node.js:** A JavaScript runtime environment that executes server-side code, providing a non-blocking, event-driven architecture ideal for building scalable web applications.
- **JSON Web Tokens (JWT):** A standard for securely transmitting information between parties as JSON objects, used for implementing user authentication and authorization.

## Deployment

EDU-Venture Server is designed to be hosted on cloud platforms such as AWS (Amazon Web Services) for scalability and reliability. It can be deployed using services like AWS Elastic Beanstalk, AWS EC2, or AWS Lambda depending on your specific requirements and infrastructure preferences.

## Getting Started

To set up and run EDU-Venture Server locally for development or testing purposes:

1. Clone this repository:
   ```
   git clone https://github.com/RinshidKP/edu-venture-server.git
   ```

2. Install dependencies:
   ```
   cd edu-venture-server
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Define environment variables such as `PORT`, `MONGODB_URI`, and any other required configuration.

4. Run the server:
   ```
   npm start
   ```

5. The server will be running at the specified port (default is 3000) and can be accessed via HTTP requests.

## Contributing

Contributions to EDU-Venture Server are welcome! Whether you want to fix bugs, add new features, or improve documentation, your contributions are highly appreciated. Please refer to the [Contribution Guidelines](CONTRIBUTING.md) for more information.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

If you have any questions or suggestions regarding EDU-Venture Server, feel free to contact us at [eduventure@example.com](mailto:eduventure@example.com).

Thank you for using EDU-Venture! We're excited to help students explore study abroad opportunities and connect with experienced consultants.

Happy learning and adventuring! 🌍📚
