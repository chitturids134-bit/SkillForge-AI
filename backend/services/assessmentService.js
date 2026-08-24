import Assessment from '../models/Assessment.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import Profile from '../models/Profile.js';

// Seed exactly the 4 requested real assessments with real technical questions
export const seedDefaultAssessments = async () => {
  const seedData = [
    {
      title: 'React 19 & State Management',
      slug: 'react-19-state-management',
      category: 'Frontend Engineering',
      skill: 'React',
      difficulty: 'Advanced',
      durationSeconds: 1800, // 30 mins
      passingPercentage: 70,
      icon: '⚛️',
      description: 'Master React 19 features, Server Components, Hooks optimization, Context patterns, and enterprise state management.',
      topics: ['React 19', 'Hooks', 'State Management', 'Performance', 'Context', 'Rendering'],
      questions: [
        {
          questionText: 'In React 19, what primary advantage does the new "use" hook provide over standard useEffect data fetching?',
          options: [
            'It automatically memoizes all state changes across components',
            'It reads resources like Promises or Context synchronously inside render and integrates with Suspense',
            'It replaces Redux store setup with built-in persistent local storage',
            'It forces components to re-render only on web worker execution completion'
          ],
          correctOptionIndex: 1,
          explanation: 'The React 19 use() API allows components to read resources like Promises or Context during render, integrating with Suspense boundaries for cleaner async handling.',
          difficulty: 'Advanced',
          topic: 'React 19'
        },
        {
          questionText: 'Which React hook is specifically designed to memoize expensive computations between component render cycles?',
          options: ['useCallback', 'useMemo', 'useRef', 'useTransition'],
          correctOptionIndex: 1,
          explanation: 'useMemo caches the result of a calculation between re-renders based on dependency array changes.',
          difficulty: 'Advanced',
          topic: 'Performance'
        },
        {
          questionText: 'What is the key difference between useCallback and useMemo?',
          options: [
            'useCallback caches a function instance itself, while useMemo caches the returned value of a function',
            'useCallback only works in server components, while useMemo is client-only',
            'useCallback mutates state directly, while useMemo returns immutable state',
            'useCallback triggers synchronous DOM mutation, while useMemo is asynchronous'
          ],
          correctOptionIndex: 0,
          explanation: 'useCallback(fn, deps) is equivalent to useMemo(() => fn, deps). It preserves function reference identity across re-renders.',
          difficulty: 'Advanced',
          topic: 'Hooks'
        },
        {
          questionText: 'How does React 19 Actions API simplify form submission and pending state management?',
          options: [
            'By converting all forms to raw HTML standard submit without JavaScript',
            'By automatically handling async transitions, optimistic UI updates, and pending states via useActionState',
            'By removing the need for controlled inputs completely in React applications',
            'By storing form inputs inside browser cookies automatically'
          ],
          correctOptionIndex: 1,
          explanation: 'React 19 Actions work with hooks like useActionState and useFormStatus to manage pending states, error boundaries, and optimistic state updates automatically.',
          difficulty: 'Advanced',
          topic: 'React 19'
        },
        {
          questionText: 'What problem occurs when passing un-memoized object literals directly into Context.Provider value prop?',
          options: [
            'A runtime syntax error is thrown by the Virtual DOM diffing engine',
            'Every consuming child component re-renders on every parent render even if context values have not changed',
            'Context values become null upon browser tab focus change',
            'State updates become strictly single-threaded and block the UI thread'
          ],
          correctOptionIndex: 1,
          explanation: 'Creating a new object literal on every render changes object reference identity, forcing all useContext subscribers to re-render unnecessarily.',
          difficulty: 'Advanced',
          topic: 'Context'
        },
        {
          questionText: 'What is the purpose of React 19 useOptimistic hook?',
          options: [
            'To predict user interaction patterns using machine learning models',
            'To render optimistic UI state immediately while an asynchronous server request is in flight',
            'To bypass React strict mode checks during production deployments',
            'To automatically retry failed HTTP requests 5 times'
          ],
          correctOptionIndex: 1,
          explanation: 'useOptimistic provides a way to show a different state while an async action (like a server mutation) is under way, automatically reverting if the action fails.',
          difficulty: 'Advanced',
          topic: 'State Management'
        },
        {
          questionText: 'Why should key props in React lists NOT use array indices when list item order can dynamically change?',
          options: [
            'Array indices cause WebGL graphics pipeline memory leaks',
            'Reordering list items causes incorrect component state mapping and inefficient DOM re-renders',
            'React throws an unhandled invariant exception when indices are used',
            'Indices disable CSS flexbox alignment rules'
          ],
          correctOptionIndex: 1,
          explanation: 'Keys identify which items have changed, been added, or removed. Using array indices when order changes causes React to misidentify component state identity.',
          difficulty: 'Advanced',
          topic: 'Rendering'
        },
        {
          questionText: 'What is the primary role of useTransition hook in React application performance tuning?',
          options: [
            'To animate CSS opacity transitions smoothly',
            'To mark state updates as non-blocking transition updates so urgent user inputs (like typing) remain responsive',
            'To transition components between client and server execution environments',
            'To defer initial component mount until page scrolling stops'
          ],
          correctOptionIndex: 1,
          explanation: 'useTransition allows you to mark state updates as transitions, keeping the UI responsive to user input while heavy rendering completes in the background.',
          difficulty: 'Advanced',
          topic: 'Performance'
        },
        {
          questionText: 'How do React Server Components (RSC) differ from traditional Client Components?',
          options: [
            'RSC execute exclusively on the server, send zero client JS bundle for component logic, and cannot use client hooks like useState',
            'RSC run only in web workers inside the user browser',
            'RSC cannot fetch database data directly',
            'RSC replace HTML markup with WebAssembly binaries'
          ],
          correctOptionIndex: 0,
          explanation: 'Server Components execute on the server during build or request time, avoiding JS payload for rendering logic while leaving interactivity to Client Components.',
          difficulty: 'Advanced',
          topic: 'Component Architecture'
        },
        {
          questionText: 'In Redux Toolkit or modern state management, what is the purpose of selector memoization (e.g. createSelector)?',
          options: [
            'To encrypt state data stored in local storage',
            'To prevent expensive derived state recalculations and unnecessary re-renders when input state slices do not change',
            'To automatically sync state across browser tabs via BroadcastChannel',
            'To convert Redux state into GraphQL queries automatically'
          ],
          correctOptionIndex: 1,
          explanation: 'Reselect / createSelector memoizes derived state values based on input selectors, recalculating only when dependencies change.',
          difficulty: 'Advanced',
          topic: 'State Management'
        }
      ]
    },
    {
      title: 'Node.js & Microservices Architecture',
      slug: 'nodejs-microservices-architecture',
      category: 'Backend Engineering',
      skill: 'Node.js',
      difficulty: 'Expert',
      durationSeconds: 2700, // 45 mins
      passingPercentage: 75,
      icon: '🟢',
      description: 'Test expertise in Node.js event loop, asynchronous I/O, microservices patterns, IPC, API gateways, and distributed event-driven messaging.',
      topics: ['Node.js', 'Express', 'Microservices', 'APIs', 'Authentication', 'Scalability', 'Event Loop'],
      questions: [
        {
          questionText: 'Which C library handles non-blocking asynchronous I/O operations and the thread pool in Node.js?',
          options: ['V8 Engine', 'Libuv', 'OpenSSL', 'Http-parser'],
          correctOptionIndex: 1,
          explanation: 'Libuv is the C library that provides the event loop, async I/O abstraction, and worker thread pool in Node.js.',
          difficulty: 'Expert',
          topic: 'Event Loop'
        },
        {
          questionText: 'In what order does the Node.js Event Loop execute its main phases?',
          options: [
            'Timers -> Pending Callbacks -> Poll -> Check -> Close Callbacks',
            'Poll -> Timers -> Check -> Close Callbacks -> Pending Callbacks',
            'Check -> Timers -> Poll -> Pending Callbacks -> Close Callbacks',
            'Timers -> Check -> Poll -> Pending Callbacks -> Close Callbacks'
          ],
          correctOptionIndex: 0,
          explanation: 'The Event Loop phases execute in order: Timers (setTimeout/setInterval) -> Pending Callbacks -> Idle/Prepare -> Poll (I/O) -> Check (setImmediate) -> Close Callbacks.',
          difficulty: 'Expert',
          topic: 'Event Loop'
        },
        {
          questionText: 'What is the purpose of the Circuit Breaker pattern in microservice architectures?',
          options: [
            'To encrypt all microservice HTTP traffic using TLS 1.3',
            'To prevent cascading system failures by failing fast when a downstream microservice is degraded or unreachable',
            'To load balance incoming HTTP requests round-robin across pod replicas',
            'To compress JSON request payloads before sending over TCP'
          ],
          correctOptionIndex: 1,
          explanation: 'Circuit Breaker monitors call failures to downstream services. Once failures exceed a threshold, it opens the circuit to prevent cascading failures and resource exhaustion.',
          difficulty: 'Expert',
          topic: 'Microservices'
        },
        {
          questionText: 'Which Node.js mechanism allows scaling HTTP server throughput across multiple CPU cores on a single physical machine?',
          options: ['Cluster module / Worker Threads', 'Child process execSync', 'V8 Garbage Collector tuning', 'Express router middleware chaining'],
          correctOptionIndex: 0,
          explanation: 'The Cluster module enables creating worker processes that share server ports to utilize multi-core CPU capacity.',
          difficulty: 'Expert',
          topic: 'Scalability'
        },
        {
          questionText: 'What is the main security advantage of asymmetric JWT signing (e.g. RS256) over symmetric signing (HS256)?',
          options: [
            'RS256 tokens are 90% smaller in payload byte size',
            'Microservices can verify token validity using a public key without needing access to the private signing key',
            'RS256 tokens do not expire',
            'RS256 prevents cross-site request forgery without cookies'
          ],
          correctOptionIndex: 1,
          explanation: 'With RS256, auth service uses a private key to sign tokens, while resource microservices verify tokens independently using only the public key.',
          difficulty: 'Expert',
          topic: 'Authentication'
        },
        {
          questionText: 'In event-driven microservices using Kafka or RabbitMQ, what does the Outbox Pattern solve?',
          options: [
            'Guarantees dual-write atomic consistency between local database updates and message broker publishing',
            'Deletes old messages from message broker topics automatically after 24 hours',
            'Encrypts outgoing HTTP headers',
            'Converts REST endpoints to WebSockets'
          ],
          correctOptionIndex: 0,
          explanation: 'The Transactional Outbox Pattern writes domain events to an outbox table within the local DB transaction, ensuring reliable message delivery without two-phase commit distributed locks.',
          difficulty: 'Expert',
          topic: 'Microservices'
        },
        {
          questionText: 'What happens when process.nextTick() is recursively invoked infinitely in Node.js?',
          options: [
            'The process switches to multi-threaded execution',
            'It starves the Event Loop from advancing to I/O phases, hanging the process',
            'Node.js automatically converts nextTick into setImmediate',
            'V8 GC forces a full process restart'
          ],
          correctOptionIndex: 1,
          explanation: 'process.nextTick queues callbacks in the microtask queue processed immediately after current operation, starving I/O phases if invoked recursively.',
          difficulty: 'Expert',
          topic: 'Event Loop'
        },
        {
          questionText: 'What is an API Gateway responsibility in a microservice enterprise architecture?',
          options: [
            'Request routing, SSL termination, rate limiting, authentication, and protocol translation',
            'Direct database table schema migrations',
            'Compiling C++ native addons',
            'Storing user session files directly on disk'
          ],
          correctOptionIndex: 0,
          explanation: 'API Gateway acts as the single entry point for client requests, handling cross-cutting concerns like auth, rate limiting, routing, and response aggregation.',
          difficulty: 'Expert',
          topic: 'APIs'
        },
        {
          questionText: 'How should uncaught exceptions (`uncaughtException`) be handled gracefully in Node.js backend services?',
          options: [
            'Log the error, gracefully close server connections/cleanup resources, and exit process (process.exit(1)) to allow orchestrator (PM2/K8s) to restart fresh',
            'Ignore the error completely and keep accepting new requests',
            'Clear the V8 heap memory using eval()',
            'Rethrow the error synchronously in an infinite loop'
          ],
          correctOptionIndex: 0,
          explanation: 'An uncaughtException leaves the process in an undefined state. Node.js documentation recommends logging, closing connections, exiting, and letting process managers restart.',
          difficulty: 'Expert',
          topic: 'Node.js'
        },
        {
          questionText: 'Which Express middleware strategy prevents HTTP Parameter Pollution (HPP) security exploits?',
          options: [
            'Validating and sanitizing query parameters to reject or normalize unexpected duplicate parameter arrays',
            'Disabling CORS completely',
            'Using HTTP POST instead of GET for all endpoints',
            'Setting Access-Control-Allow-Origin to wildcard *'
          ],
          correctOptionIndex: 0,
          explanation: 'HTTP Parameter Pollution exploits parameter parsing ambiguities when duplicate parameters are sent. HPP middleware cleanses request parameters.',
          difficulty: 'Expert',
          topic: 'Express'
        }
      ]
    },
    {
      title: 'System Design & Distributed Storage',
      slug: 'system-design-distributed-storage',
      category: 'System Design & Architecture',
      skill: 'System Design',
      difficulty: 'Senior',
      durationSeconds: 3600, // 60 mins
      passingPercentage: 70,
      icon: '🏗️',
      description: 'Evaluate high-availability system architecture, CAP theorem, distributed storage, database sharding, caching strategies, and load balancing.',
      topics: ['Scalability', 'Load Balancing', 'Caching', 'Databases', 'Replication', 'Sharding', 'Consistency', 'Fault Tolerance'],
      questions: [
        {
          questionText: 'According to the CAP Theorem, which two properties can a distributed data store choose under a network partition (P)?',
          options: [
            'Consistency (C) OR Availability (A)',
            'Consistency (C) AND Performance (P)',
            'Availability (A) AND Latency (L)',
            'Durability (D) AND Atomicity (A)'
          ],
          correctOptionIndex: 0,
          explanation: 'CAP theorem proves that under network partition (P), a distributed system must trade off between Consistency (CP) or Availability (AP).',
          difficulty: 'Senior',
          topic: 'Consistency'
        },
        {
          questionText: 'What is the main benefit of Consistent Hashing over traditional hash mod N sharding in distributed caching systems?',
          options: [
            'Consistent hashing guarantees zero network latency across data centers',
            'When nodes are added or removed, only K/N keys need to be remapped on average instead of remapping almost all keys',
            'Consistent hashing eliminates the need for primary database storage',
            'Consistent hashing encrypts cached values with AES-256'
          ],
          correctOptionIndex: 1,
          explanation: 'Consistent Hashing minimizes key movement during cluster scaling/resharding, remapping only a fraction of keys proportional to 1/N.',
          difficulty: 'Senior',
          topic: 'Sharding'
        },
        {
          questionText: 'Which caching strategy writes data to cache and database concurrently before returning success to the client?',
          options: ['Cache-Aside (Lazy Loading)', 'Write-Through', 'Write-Behind (Write-Back)', 'Read-Through'],
          correctOptionIndex: 1,
          explanation: 'Write-Through cache writes data to the cache and database simultaneously, ensuring consistency at the cost of higher write latency.',
          difficulty: 'Senior',
          topic: 'Caching'
        },
        {
          questionText: 'What is the purpose of database Read Replicas in high-traffic web applications?',
          options: [
            'To offload read queries from the primary database, improving read throughput and system availability',
            'To handle write transactions faster by skipping write logging',
            'To automatically generate frontend UI components',
            'To replace redis in-memory caching'
          ],
          correctOptionIndex: 0,
          explanation: 'Read replicas duplicate primary database data asynchronously, allowing read-heavy traffic to scale horizontally.',
          difficulty: 'Senior',
          topic: 'Replication'
        },
        {
          questionText: 'In distributed consensus algorithms (like Raft or Paxos), what role does a Leader node play?',
          options: [
            'Coordinates log replication, orders write transactions, and maintains cluster state consensus across follower nodes',
            'Deletes expired database indexes every 24 hours',
            'Routes external DNS queries to nearest edge CDN node',
            'Generates SSL certificates automatically'
          ],
          correctOptionIndex: 0,
          explanation: 'Raft/Paxos leader node accepts client writes, appends log entries, and replicates them to follower nodes until majority quorum consensus is reached.',
          difficulty: 'Senior',
          topic: 'Fault Tolerance'
        },
        {
          questionText: 'What is the primary difference between Horizontal Scaling (Scaling Out) and Vertical Scaling (Scaling Up)?',
          options: [
            'Horizontal scaling adds more machine instances to a pool, while vertical scaling adds resources (RAM/CPU) to a single machine instance',
            'Horizontal scaling increases network bandwidth, vertical scaling increases SSD storage size only',
            'Horizontal scaling is only for frontend apps, vertical scaling is for databases',
            'Horizontal scaling is synchronous, vertical scaling is asynchronous'
          ],
          correctOptionIndex: 0,
          explanation: 'Scaling out adds more server nodes to distribute load, whereas scaling up upgrades the hardware specs of an existing node.',
          difficulty: 'Senior',
          topic: 'Scalability'
        },
        {
          questionText: 'How does a Reverse Proxy (e.g. Nginx, HAProxy) differ from a Forward Proxy?',
          options: [
            'A Reverse Proxy acts on behalf of backend servers (load balancing, SSL termination), whereas a Forward Proxy acts on behalf of clients (privacy, filtering)',
            'A Reverse Proxy only works with UDP protocol',
            'A Reverse Proxy requires client browser plugin installation',
            'A Reverse Proxy cannot cache static assets'
          ],
          correctOptionIndex: 0,
          explanation: 'Reverse proxy sits in front of backend servers intercepting incoming requests, while forward proxy sits in front of clients intercepting outgoing requests.',
          difficulty: 'Senior',
          topic: 'Load Balancing'
        },
        {
          questionText: 'What problem does the Bloom Filter data structure solve in large distributed databases (e.g. Cassandra, RocksDB)?',
          options: [
            'Efficiently tests whether an element is definitely NOT in a set before performing costly disk I/O lookups',
            'Sorts strings in lexicographical order in O(1) time',
            'Compresses PNG image uploads automatically',
            'Encrypts user passwords using salt'
          ],
          correctOptionIndex: 0,
          explanation: 'Bloom Filter is a space-efficient probabilistic data structure that quickly determines if an item is absent from disk, preventing unnecessary disk reads.',
          difficulty: 'Senior',
          topic: 'Databases'
        },
        {
          questionText: 'What is the purpose of database Rate Limiting algorithms like Token Bucket or Leaky Bucket?',
          options: [
            'To control API traffic throughput, protecting backend systems against DDoS attacks and resource starvation',
            'To limit disk space usage of log files',
            'To automatically compress database indexes',
            'To limit maximum length of user passwords'
          ],
          correctOptionIndex: 0,
          explanation: 'Rate limiting algorithms throttle incoming client traffic to prevent API abuse, server degradation, or service outages.',
          difficulty: 'Senior',
          topic: 'Fault Tolerance'
        },
        {
          questionText: 'What is Eventual Consistency in distributed database design?',
          options: [
            'A data consistency model guarantees that if no new updates are made, all replicas will eventually return the same latest value',
            'A model where data is never consistent across database nodes',
            'A model where writes are rejected if network latency exceeds 5ms',
            'A model where reads are strictly blocked until disk fsync completes'
          ],
          correctOptionIndex: 0,
          explanation: 'Eventual consistency allows temporary replication lag across distributed nodes, ensuring eventual convergence without sacrificing high write availability.',
          difficulty: 'Senior',
          topic: 'Consistency'
        }
      ]
    },
    {
      title: 'GenAI & Vector Database Indexing',
      slug: 'genai-vector-database-indexing',
      category: 'AI & Machine Learning',
      skill: 'AI/ML',
      difficulty: 'Specialist',
      durationSeconds: 2400, // 40 mins
      passingPercentage: 75,
      icon: '🤖',
      description: 'Assess knowledge of Generative AI architectures, vector embeddings, similarity metrics, HNSW indexing, RAG pipelines, and LLM orchestration.',
      topics: ['LLMs', 'Embeddings', 'Vector Databases', 'Similarity Search', 'RAG', 'Chunking', 'Indexing', 'Retrieval', 'Prompt Engineering'],
      questions: [
        {
          questionText: 'What is a vector embedding in modern LLM and AI semantic search pipelines?',
          options: [
            'A dense numerical vector representation of unstructured data (text/image) in a high-dimensional continuous vector space',
            'A compressed ZIP file containing raw text documents',
            'A secret API key string used to authenticate OpenAI requests',
            'An HTML canvas rendering element'
          ],
          correctOptionIndex: 0,
          explanation: 'Embeddings map text or media into high-dimensional floating-point vectors such that semantically similar concepts lie close together in vector space.',
          difficulty: 'Specialist',
          topic: 'Embeddings'
        },
        {
          questionText: 'Which mathematical metric measures the angle cosine between two vector embeddings to determine semantic similarity regardless of magnitude?',
          options: ['Cosine Similarity', 'Manhattan Distance (L1)', 'Hamming Distance', 'Jaccard Index'],
          correctOptionIndex: 0,
          explanation: 'Cosine similarity calculates cos(theta) between two vectors, ranging from -1 to 1, measuring directional similarity independent of vector magnitude.',
          difficulty: 'Specialist',
          topic: 'Similarity Search'
        },
        {
          questionText: 'What does HNSW stand for in vector database indexing (e.g. Pinecone, Milvus, Qdrant)?',
          options: [
            'Hierarchical Navigable Small World',
            'High Network System Wide',
            'Hyper Text Node Search Web',
            'Heterogeneous Neural State Weight'
          ],
          correctOptionIndex: 0,
          explanation: 'HNSW (Hierarchical Navigable Small World) is an approximate nearest neighbor (ANN) graph index structure providing logarithmic search time complexity.',
          difficulty: 'Specialist',
          topic: 'Indexing'
        },
        {
          questionText: 'What is the core architecture component of Retrieval-Augmented Generation (RAG)?',
          options: [
            'Retrieving relevant document chunks from a vector database and injecting them as context into the LLM prompt before generation',
            'Fine-tuning LLM weights on every incoming user HTTP query',
            'Converting LLM output into SQL queries exclusively',
            'Compressing model weights from 16-bit to 4-bit quantization'
          ],
          correctOptionIndex: 0,
          explanation: 'RAG retrieves domain-specific contextual knowledge from external databases and feeds it into the LLM context window to ground generated responses in truth.',
          difficulty: 'Specialist',
          topic: 'RAG'
        },
        {
          questionText: 'Why is document Chunking with overlap necessary when preparing documents for vector indexing?',
          options: [
            'To fit text within LLM context window constraints while maintaining semantic context continuity across boundary cuts',
            'To encrypt sensitive document data before sending over HTTPS',
            'To convert text from English to Spanish automatically',
            'To bypass vector database storage limits'
          ],
          correctOptionIndex: 0,
          explanation: 'Chunking breaks large texts into embedding-friendly sizes. Overlap preserves semantic context across chunk boundary edges.',
          difficulty: 'Specialist',
          topic: 'Chunking'
        },
        {
          questionText: 'How does Few-Shot Prompting differ from Zero-Shot Prompting in LLM prompt engineering?',
          options: [
            'Few-Shot includes several explicit example input-output pairs inside the prompt to guide model task completion',
            'Few-Shot uses fewer tokens in total than Zero-Shot',
            'Few-Shot trains model weights on GPU clusters',
            'Few-Shot only works with image input models'
          ],
          correctOptionIndex: 0,
          explanation: 'Few-shot prompting provides high-quality input-output demonstrations within the prompt to guide the model toward desired output formats and reasoning styles.',
          difficulty: 'Specialist',
          topic: 'Prompt Engineering'
        },
        {
          questionText: 'What is the role of a Re-ranking model (e.g. Cohere Rerank) in advanced RAG pipelines?',
          options: [
            'To re-evaluate top K vector retrieval results using a fine-grained cross-encoder model to score true relevance before LLM generation',
            'To delete low scoring documents from the vector database permanently',
            'To translate search queries into 50 languages',
            'To generate synthetic training datasets'
          ],
          correctOptionIndex: 0,
          explanation: 'Re-rankers use full cross-encoder attention over (query, document) pairs to re-order initial fast bi-encoder vector search results for higher precision context.',
          difficulty: 'Specialist',
          topic: 'Retrieval'
        },
        {
          questionText: 'What is LLM Hallucination?',
          options: [
            'When an LLM generates plausible-sounding but factually incorrect or unsupported assertions',
            'When an LLM response takes longer than 10 seconds to stream',
            'When an LLM runs out of GPU memory',
            'When an LLM outputs valid JSON instead of Markdown'
          ],
          correctOptionIndex: 0,
          explanation: 'Hallucination occurs when generative models generate confident answers that lack grounding in training data or prompt context.',
          difficulty: 'Specialist',
          topic: 'LLMs'
        },
        {
          questionText: 'What is the trade-off of using IVF (Inverted File Index) vector indexing over Flat (exact search) indexing?',
          options: [
            'IVF speeds up search queries drastically on large datasets, but achieves slightly lower recall accuracy (Approximate Nearest Neighbor)',
            'IVF is slower than flat index but uses 10x more RAM',
            'IVF requires quantum hardware processors',
            'IVF only supports 2-dimensional vectors'
          ],
          correctOptionIndex: 0,
          explanation: 'IVF partitions vector space into Voronoi cells to narrow search space, achieving massive speedup at the cost of approximate recall vs exact flat search.',
          difficulty: 'Specialist',
          topic: 'Indexing'
        },
        {
          questionText: 'What does Temperature parameter control in LLM response generation sampling?',
          options: [
            'Controls randomness/creativity of output token selection (higher = more creative/random, lower = more deterministic)',
            'Controls server CPU cooling fan speed',
            'Controls max token length of response',
            'Controls network request timeout in milliseconds'
          ],
          correctOptionIndex: 0,
          explanation: 'Temperature scales logit probabilities before softmax sampling. Lower values (e.g. 0.0) make token selection deterministic, while higher values increase variability.',
          difficulty: 'Specialist',
          topic: 'LLMs'
        }
      ]
    }
  ];

  for (const item of seedData) {
    await Assessment.findOneAndUpdate(
      { slug: item.slug },
      { $set: item },
      { upsert: true, new: true }
    );
  }
};

/**
 * Get Available Assessments (Sanitized, no correctOptionIndex exposed)
 */
export const getAvailableAssessmentsService = async (userId) => {
  await seedDefaultAssessments();

  const assessments = await Assessment.find().lean();

  // Sanitize catalog list
  const sanitizedCatalog = assessments.map(item => ({
    _id: item._id,
    title: item.title,
    slug: item.slug,
    category: item.category,
    skill: item.skill,
    difficulty: item.difficulty,
    durationSeconds: item.durationSeconds,
    durationMinutes: Math.round(item.durationSeconds / 60),
    passingPercentage: item.passingPercentage,
    icon: item.icon,
    description: item.description,
    topics: item.topics || [],
    questionCount: item.questions?.length || 0,
  }));

  // Fetch User stats from AssessmentAttempt
  const userAttempts = await AssessmentAttempt.find({ user: userId, status: 'completed' });
  const completedCount = userAttempts.length;
  const scores = userAttempts.map(a => a.percentage || 0);
  const avgScore = completedCount > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / completedCount) : 0;
  const bestScore = completedCount > 0 ? Math.max(...scores) : 0;

  // Badges earned count (passed assessments)
  const passedAttempts = userAttempts.filter(a => a.passed);
  const uniqueBadges = new Set(passedAttempts.map(a => a.assessment.toString()));

  return {
    assessments: sanitizedCatalog,
    stats: {
      completed: completedCount,
      avgScore,
      bestScore,
      badgesEarned: uniqueBadges.size,
    }
  };
};

/**
 * Start a new Assessment Attempt
 */
export const startAssessmentAttemptService = async (userId, assessmentId) => {
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) {
    throw new Error('Assessment not found');
  }

  // Mark previous in-progress attempts for this assessment as abandoned
  await AssessmentAttempt.updateMany(
    { user: userId, assessment: assessmentId, status: 'in-progress' },
    { $set: { status: 'abandoned' } }
  );

  const attempt = await AssessmentAttempt.create({
    user: userId,
    assessment: assessmentId,
    status: 'in-progress',
    currentQuestionIndex: 0,
    answers: [],
    score: 0,
    percentage: 0,
    correctAnswersCount: 0,
    totalQuestions: assessment.questions.length,
    passed: false,
    startedAt: new Date(),
  });

  // Return attempt info with sanitized questions (no correctOptionIndex)
  const sanitizedQuestions = assessment.questions.map((q, idx) => ({
    questionIndex: idx,
    questionText: q.questionText,
    options: q.options,
    difficulty: q.difficulty,
    topic: q.topic,
  }));

  return {
    attemptId: attempt._id,
    assessment: {
      _id: assessment._id,
      title: assessment.title,
      skill: assessment.skill,
      category: assessment.category,
      difficulty: assessment.difficulty,
      durationSeconds: assessment.durationSeconds,
      passingPercentage: assessment.passingPercentage,
      icon: assessment.icon,
      totalQuestions: assessment.questions.length,
    },
    startedAt: attempt.startedAt,
    currentQuestionIndex: 0,
    questions: sanitizedQuestions,
  };
};

/**
 * Get Active Assessment Attempt for Refresh Recovery
 */
export const getActiveAssessmentAttemptService = async (userId) => {
  const activeAttempt = await AssessmentAttempt.findOne({
    user: userId,
    status: 'in-progress',
  }).populate('assessment');

  if (!activeAttempt || !activeAttempt.assessment) {
    return null;
  }

  const assessment = activeAttempt.assessment;

  // Sanitize questions
  const sanitizedQuestions = assessment.questions.map((q, idx) => ({
    questionIndex: idx,
    questionText: q.questionText,
    options: q.options,
    difficulty: q.difficulty,
    topic: q.topic,
  }));

  return {
    attemptId: activeAttempt._id,
    assessment: {
      _id: assessment._id,
      title: assessment.title,
      skill: assessment.skill,
      category: assessment.category,
      difficulty: assessment.difficulty,
      durationSeconds: assessment.durationSeconds,
      passingPercentage: assessment.passingPercentage,
      icon: assessment.icon,
      totalQuestions: assessment.questions.length,
    },
    startedAt: activeAttempt.startedAt,
    currentQuestionIndex: activeAttempt.currentQuestionIndex || 0,
    savedAnswers: activeAttempt.answers || [],
    questions: sanitizedQuestions,
  };
};

/**
 * Get Specific Attempt Details
 */
export const getAssessmentAttemptService = async (userId, attemptId) => {
  const attempt = await AssessmentAttempt.findById(attemptId).populate('assessment');
  if (!attempt || attempt.user.toString() !== userId) {
    throw new Error('Assessment attempt not found or unauthorized');
  }

  const assessment = attempt.assessment;
  const sanitizedQuestions = assessment.questions.map((q, idx) => ({
    questionIndex: idx,
    questionText: q.questionText,
    options: q.options,
    difficulty: q.difficulty,
    topic: q.topic,
  }));

  return {
    attemptId: attempt._id,
    status: attempt.status,
    assessment: {
      _id: assessment._id,
      title: assessment.title,
      skill: assessment.skill,
      category: assessment.category,
      difficulty: assessment.difficulty,
      durationSeconds: assessment.durationSeconds,
      passingPercentage: assessment.passingPercentage,
      icon: assessment.icon,
      totalQuestions: assessment.questions.length,
    },
    startedAt: attempt.startedAt,
    currentQuestionIndex: attempt.currentQuestionIndex || 0,
    savedAnswers: attempt.answers || [],
    questions: sanitizedQuestions,
    result: attempt.result,
  };
};

/**
 * Submit Answer for Question
 */
export const submitQuestionAnswerService = async (userId, attemptId, questionIndex, selectedOptionIndex) => {
  const attempt = await AssessmentAttempt.findById(attemptId).populate('assessment');
  if (!attempt || attempt.user.toString() !== userId) {
    throw new Error('Assessment attempt not found or unauthorized');
  }

  if (attempt.status !== 'in-progress') {
    throw new Error('This assessment session is no longer active.');
  }

  const idx = parseInt(questionIndex, 10);
  const selIdx = parseInt(selectedOptionIndex, 10);

  if (isNaN(idx) || idx < 0 || idx >= attempt.assessment.questions.length) {
    throw new Error('Invalid question index.');
  }

  const questionObj = attempt.assessment.questions[idx];
  const isCorrect = questionObj.correctOptionIndex === selIdx;

  // Update or push answer
  const existingAnsIdx = attempt.answers.findIndex(a => a.questionIndex === idx);
  if (existingAnsIdx >= 0) {
    attempt.answers[existingAnsIdx].selectedOptionIndex = selIdx;
    attempt.answers[existingAnsIdx].isCorrect = isCorrect;
    attempt.answers[existingAnsIdx].answeredAt = new Date();
  } else {
    attempt.answers.push({
      questionIndex: idx,
      selectedOptionIndex: selIdx,
      isCorrect,
      answeredAt: new Date(),
    });
  }

  // Update current index
  attempt.currentQuestionIndex = Math.min(attempt.assessment.questions.length - 1, idx + 1);

  await attempt.save();

  return {
    success: true,
    questionIndex: idx,
    selectedOptionIndex: selIdx,
    currentQuestionIndex: attempt.currentQuestionIndex,
    totalAnswered: attempt.answers.length,
    totalQuestions: attempt.assessment.questions.length,
  };
};

/**
 * Complete Assessment Attempt and Generate Server-Side Result
 */
export const completeAssessmentAttemptService = async (userId, attemptId, timeTakenSeconds = 0) => {
  const attempt = await AssessmentAttempt.findById(attemptId).populate('assessment');
  if (!attempt || attempt.user.toString() !== userId) {
    throw new Error('Assessment attempt not found or unauthorized');
  }

  const assessment = attempt.assessment;

  let correctCount = 0;
  const topicMap = {};

  // Process all assessment questions
  assessment.questions.forEach((q, idx) => {
    const userAns = attempt.answers.find(a => a.questionIndex === idx);
    const isCorrect = userAns && userAns.selectedOptionIndex === q.correctOptionIndex;

    if (isCorrect) correctCount++;

    const tName = q.topic || 'General';
    if (!topicMap[tName]) {
      topicMap[tName] = { correct: 0, total: 0 };
    }
    topicMap[tName].total += 1;
    if (isCorrect) topicMap[tName].correct += 1;
  });

  const totalQuestions = assessment.questions.length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const passed = percentage >= assessment.passingPercentage;

  // Readiness Level
  let readinessLevel = 'Needs Improvement';
  if (percentage >= 90) readinessLevel = 'Expert';
  else if (percentage >= 80) readinessLevel = 'Advanced';
  else if (percentage >= 70) readinessLevel = 'Strong';
  else if (percentage >= 60) readinessLevel = 'Developing';

  // Topic Breakdown array
  const topicBreakdown = Object.keys(topicMap).map(topic => {
    const item = topicMap[topic];
    return {
      topic,
      correct: item.correct,
      total: item.total,
      percentage: Math.round((item.correct / item.total) * 100),
    };
  });

  // Strengths & Weaknesses
  const strengths = [];
  const weaknesses = [];
  const recommendations = [];

  topicBreakdown.forEach(tb => {
    if (tb.percentage >= 80) {
      strengths.push(`Strong mastery in ${tb.topic} (${tb.percentage}% score).`);
    } else if (tb.percentage < 60) {
      weaknesses.push(`Needs review in ${tb.topic} (${tb.percentage}% accuracy).`);
      recommendations.push(`Practice focused tutorials and exercises on ${tb.topic}.`);
    }
  });

  if (strengths.length === 0) {
    strengths.push('Completed practice evaluation session.');
  }

  if (weaknesses.length === 0) {
    weaknesses.push('No major weak skill areas identified.');
  }

  if (passed) {
    recommendations.push(`Earned ${assessment.skill} Verified Skill Badge on your developer profile!`);
  } else {
    recommendations.push(`Review study topics and retake the ${assessment.title} assessment to achieve passing score (${assessment.passingPercentage}%).`);
  }

  // Finalize attempt
  attempt.status = 'completed';
  attempt.score = correctCount;
  attempt.correctAnswersCount = correctCount;
  attempt.totalQuestions = totalQuestions;
  attempt.percentage = percentage;
  attempt.passed = passed;
  attempt.timeTakenSeconds = timeTakenSeconds || Math.round((new Date() - new Date(attempt.startedAt)) / 1000);
  attempt.completedAt = new Date();
  attempt.result = {
    overallScore: correctCount,
    percentage,
    readinessLevel,
    strengths,
    weaknesses,
    recommendations,
    topicBreakdown,
  };

  await attempt.save();

  // If passed, update Profile skills / badges
  if (passed) {
    try {
      const profile = await Profile.findOne({ user: userId });
      if (profile) {
        // Add skill if missing or update proficiency
        const existingSkill = profile.skills.find(s => (typeof s === 'string' ? s : s.name).toLowerCase() === assessment.skill.toLowerCase());
        if (!existingSkill) {
          profile.skills.push({ name: assessment.skill, level: 'Advanced' });
          await profile.save();
        }
      }
    } catch (profErr) {
      console.error('Profile update error on assessment pass:', profErr.message);
    }
  }

  return attempt;
};

/**
 * Get User Assessment History
 */
export const getUserAssessmentHistoryService = async (userId) => {
  return await AssessmentAttempt.find({ user: userId })
    .populate('assessment', 'title category skill difficulty icon durationSeconds passingPercentage')
    .sort({ createdAt: -1 });
};

/**
 * Get Full Attempt Report for Completed Assessment
 */
export const getAttemptReportService = async (userId, attemptId) => {
  const attempt = await AssessmentAttempt.findById(attemptId).populate('assessment');
  if (!attempt || attempt.user.toString() !== userId) {
    throw new Error('Assessment report not found or unauthorized');
  }

  const assessment = attempt.assessment;

  // Build question breakdown with correct options & explanations
  const questionBreakdown = assessment.questions.map((q, idx) => {
    const userAns = attempt.answers.find(a => a.questionIndex === idx);
    const selIdx = userAns ? userAns.selectedOptionIndex : -1;
    const isCorrect = userAns ? userAns.isCorrect : false;

    return {
      questionIndex: idx,
      questionText: q.questionText,
      options: q.options,
      selectedOptionIndex: selIdx,
      correctOptionIndex: q.correctOptionIndex,
      isCorrect,
      explanation: q.explanation,
      difficulty: q.difficulty,
      topic: q.topic,
    };
  });

  return {
    attemptId: attempt._id,
    assessment: {
      title: assessment.title,
      category: assessment.category,
      skill: assessment.skill,
      difficulty: assessment.difficulty,
      passingPercentage: assessment.passingPercentage,
      icon: assessment.icon,
    },
    startedAt: attempt.startedAt,
    completedAt: attempt.completedAt,
    timeTakenSeconds: attempt.timeTakenSeconds,
    percentage: attempt.percentage,
    passed: attempt.passed,
    score: attempt.score,
    totalQuestions: attempt.totalQuestions,
    result: attempt.result,
    questions: questionBreakdown,
  };
};

/**
 * Delete Attempt Record
 */
export const deleteAttemptService = async (userId, attemptId) => {
  const attempt = await AssessmentAttempt.findById(attemptId);
  if (!attempt || attempt.user.toString() !== userId) {
    throw new Error('Assessment attempt not found or unauthorized');
  }

  await AssessmentAttempt.findByIdAndDelete(attemptId);
  return { success: true, message: 'Assessment attempt deleted successfully' };
};
