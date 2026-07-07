export const interviewQuestions = {
  Technical: {
    Beginner: [
      { question: "Explain React Hooks and how they differ from Class component lifecycles." },
      { question: "What is JWT (JSON Web Token) and what is it typically used for?" },
      { question: "Describe the primary differences between SQL (Relational) and NoSQL (Non-Relational) databases." },
      { question: "What is a REST API and what are the main HTTP methods used in REST?" },
      { question: "Explain the Node.js Event Loop at a high level." },
      { question: "What is DOM (Document Object Model) and how does virtual DOM in React improve performance?" },
      { question: "What is the difference between 'let', 'const', and 'var' in JavaScript?" },
      { question: "Explain what CSS box model is and name its core parts." },
      { question: "What is Git and how do 'git pull' and 'git fetch' differ?" },
      { question: "What is semantic HTML and why is it important for SEO and accessibility?" }
    ],
    Intermediate: [
      { question: "Explain promises in JavaScript, including Promise.all, Promise.race, and async/await." },
      { question: "How does Middleware work in Express.js? Explain with an example." },
      { question: "What is database indexing and how does it improve query execution times? Are there downsides?" },
      { question: "Explain state management patterns in React. When would you prefer Context API over Redux?" },
      { question: "What are CORS (Cross-Origin Resource Sharing) issues and how do you resolve them in Express?" },
      { question: "Explain React's reconciliation algorithm and the purpose of key prop in lists." },
      { question: "Describe MVC (Model-View-Controller) architecture and how it is applied in MERN stack." },
      { question: "How do you handle password encryption on the backend? Describe bcrypt hashing." },
      { question: "What are React Router's Protected Routes and how do you implement them?" },
      { question: "What is the difference between authentication and authorization? Provide examples of both." }
    ],
    Advanced: [
      { question: "How do you optimize React application performance? Detail memoization, code-splitting, and lazy loading." },
      { question: "Explain database replication, sharding, and clustering. How do they support horizontal scaling?" },
      { question: "Describe security best practices for Node/Express applications (XSS, CSRF, NoSQL injection prevention)." },
      { question: "Explain JWT token expiration strategies, including access tokens, refresh tokens, and token revocation." },
      { question: "How do Microservices architectures differ from Monolithic setups? What are the network overhead tradeoffs?" },
      { question: "Explain event-driven architectures. How do message brokers like RabbitMQ or Kafka handle high-throughput?" },
      { question: "What is lazy loading of database associations (Mongoose populate vs manual subqueries) and performance implications?" },
      { question: "Detail the differences between WebSockets and HTTP long polling for real-time application features." },
      { question: "How do you handle transaction management and data consistency in MongoDB (ACID transactions)?" },
      { question: "Explain Docker containerization and how it assists in maintaining environment parity from dev to production." }
    ]
  },
  HR: {
    Beginner: [
      { question: "Tell me about yourself and your background." },
      { question: "Why should we hire you for this role?" },
      { question: "What are your core strengths?" },
      { question: "What do you know about our company?" },
      { question: "Where do you see yourself in five years?" },
      { question: "What are your hobbies and interest areas outside work?" },
      { question: "What is your preferred work environment (remote, hybrid, or onsite)?" },
      { question: "Are you willing to relocate if needed for the position?" },
      { question: "Why did you choose your field of study or college major?" },
      { question: "What are your salary expectations for this position?" }
    ],
    Intermediate: [
      { question: "Why are you looking to leave your current company or previous role?" },
      { question: "How do you handle constructive criticism and feedback from peers or managers?" },
      { question: "What are your weaknesses, and what actions are you taking to improve them?" },
      { question: "Describe a time when you went above and beyond for a task or assignment." },
      { question: "How do you handle disagreement with a manager's decision?" },
      { question: "Describe your ideal manager and what style of guidance you work best with." },
      { question: "How do you prioritize tasks when multiple deadlines are close?" },
      { question: "What motivates you most at work (recognition, learning, financial incentives)?" },
      { question: "How do you keep yourself updated with changing industry trends?" },
      { question: "Why is professional development important to you?" }
    ],
    Advanced: [
      { question: "Tell me about a major career mistake you made, and what lessons did you learn from it." },
      { question: "How do you align your professional goals with our company's mission and core values?" },
      { question: "How do you handle being delegated tasks that fall outside your technical job description?" },
      { question: "Describe a situation where you had to lead a project under extreme ambiguity." },
      { question: "Where do you see the future of this industry heading in the next 5-10 years?" },
      { question: "How do you advocate for diversity and inclusion in your team environment?" },
      { question: "How do you manage stress and prevent burnout during high-pressure releases?" },
      { question: "What is your philosophy on work-life balance and how do you practice it?" },
      { question: "How would you handle a team member who is underperforming and dragging down project speed?" },
      { question: "What legacy or major impact do you wish to leave behind at your next workplace?" }
    ]
  },
  Behavioral: {
    Beginner: [
      { question: "Describe a challenging situation you faced in college or work, and how you resolved it." },
      { question: "How do you handle tight deadlines or pressure?" },
      { question: "Describe a successful teamwork experience you've had." },
      { question: "Tell me about a time you had to learn a new tool or technology quickly." },
      { question: "Describe a conflict you had with a classmate or coworker, and how you resolved it." },
      { question: "Tell me about a goal you set for yourself and how you went about achieving it." },
      { question: "Describe a time when you made a mistake on a project. What did you do?" },
      { question: "How do you handle task interruptions or sudden changes in plan?" },
      { question: "Describe a time you had to explain a complex topic to someone with less technical knowledge." },
      { question: "Describe a time when you felt overwhelmed by your workload. How did you react?" }
    ],
    Intermediate: [
      { question: "Describe a time you had to work with a difficult team member. How did you manage the relationship?" },
      { question: "Tell me about a project that did not go as planned. What went wrong and how did you adapt?" },
      { question: "Describe a situation where you had to persuade someone to see your point of view." },
      { question: "Tell me about a time you solved a complex problem without clear instructions." },
      { question: "Describe a time you had to manage multiple projects simultaneously. How did you keep them on track?" },
      { question: "Describe a time you had to deliver bad news to a manager, coworker, or client." },
      { question: "Tell me about a time you noticed an inefficiency in a process. What did you do to improve it?" },
      { question: "Describe a scenario where you had to work under a manager whose style was very different from yours." },
      { question: "Tell me about a time you took the initiative to learn something outside your assignment bounds." },
      { question: "Describe a time when you received negative feedback. How did you respond?" }
    ],
    Advanced: [
      { question: "Describe a high-stakes conflict within your team. What steps did you take to mediate and find a consensus?" },
      { question: "Tell me about a strategic decision you made that failed. What was the impact, and how did you pivot?" },
      { question: "Describe a time you had to sacrifice short-term code quality for long-term project speed (technical debt trade-offs)." },
      { question: "Describe how you managed a project when team members had conflicting technical architectures." },
      { question: "Tell me about a time you had to lead a project where the client changed requirements midway through development." },
      { question: "Describe a time you mentored or coached a junior team member. What was the outcome?" },
      { question: "Tell me about a time you had to align multiple stakeholders with diverging business goals." },
      { question: "Describe a situation where you had to make a critical technical choice with incomplete data." },
      { question: "Tell me about a time you stood up for an ethical choice or best practice despite pushback." },
      { question: "Describe a time you had to advocate for a project that was initially rejected by management." }
    ]
  }
};
