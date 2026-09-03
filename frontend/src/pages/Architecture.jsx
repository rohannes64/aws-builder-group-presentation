import { useState } from "react";

const NODES = [
  {
    tag: "Frontend",
    name: "S3 static website",
    summary: "Hosts the React app you're using right now.",
    detail:
      "The built frontend (this app) is uploaded to an S3 bucket configured for static website hosting. No server to run or patch — S3 just serves the files.",
  },
  {
    tag: "Entry point",
    name: "API Gateway",
    summary: "The public HTTP entry point that routes requests to Lambda.",
    detail:
      "Every request from this frontend (POST /register, POST /checkin, GET /event, GET /stats, POST /certificate) hits API Gateway first. It handles routing, CORS, and request validation before invoking a Lambda function.",
  },
  {
    tag: "Compute",
    name: "Lambda (API functions)",
    summary: "Runs backend logic without a continuously running server.",
    detail:
      "Separate functions handle separate responsibilities: registerUser, checkInUser, getEvent, getStats, queueCertificate. Each only has the IAM permissions it actually needs.",
  },
  {
    tag: "Database",
    name: "DynamoDB",
    summary: "Stores registrations, check-ins, and event data.",
    detail:
      "A managed NoSQL database. Duplicate registrations and duplicate check-ins are both prevented with conditional writes (ConditionExpression: attribute_not_exists(...)) rather than a separate check-then-write step, which would race under concurrent requests.",
  },
  {
    tag: "Queue",
    name: "SQS",
    summary: "Buffers certificate jobs so check-in doesn't wait on them.",
    detail:
      "After a successful check-in, a certificate-generation job is placed on a queue instead of being processed inline. If a job fails, it's retried up to a limit, then routed to a Dead Letter Queue instead of retrying forever.",
  },
  {
    tag: "Worker",
    name: "Certificate worker Lambda",
    summary: "Consumes queued jobs and generates certificates.",
    detail:
      "Triggered by the SQS queue. Generates a certificate, uploads it to S3, updates the registration record in DynamoDB, and publishes a CERTIFICATE_ISSUED event.",
  },
  {
    tag: "Storage",
    name: "S3 (certificates)",
    summary: "Stores generated certificates and other assets.",
    detail:
      "Object storage, not a database — good for files like certificates and static assets, addressed by key rather than queried.",
  },
  {
    tag: "Events",
    name: "EventBridge",
    summary: "Decouples analytics from the main request path.",
    detail:
      "REGISTRATION, CHECK_IN, and certificate lifecycle events are published here. The analytics worker listens for them and updates aggregate stats, so the registration and check-in Lambdas never need to know analytics exists.",
  },
  {
    tag: "Compute",
    name: "Analytics worker Lambda",
    summary: "The only writer to the Stats table.",
    detail:
      "Triggered by EventBridge, not by the API Lambdas directly. Increments counters (registrations, check-ins, pending/issued certificates) that GET /stats reads from.",
  },
  {
    tag: "Observability",
    name: "CloudWatch",
    summary: "Logs, metrics, and alarms for everything above.",
    detail:
      "Every Lambda's logs land here automatically. Alarms watch for things like Lambda error rate and SQS queue depth, so failures surface before someone notices missing certificates.",
  },
  {
    tag: "Security",
    name: "IAM",
    summary: "Least-privilege roles for every function.",
    detail:
      "Each Lambda gets its own role scoped to exactly the tables, queues, and buckets it touches — never AdministratorAccess. See the IAM table in the development plan for the full breakdown.",
  },
];

export default function Architecture() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="page">
      <p className="eyebrow">Architecture</p>
      <h1 className="page-title">How a request moves through the system</h1>
      <p className="page-lede">
        Each step below is a real AWS service this platform uses, in roughly the order a request
        passes through them. Select one to see what it does and why it's there.
      </p>

      <div className="flow">
        {NODES.map((node, index) => {
          const isOpen = openIndex === index;
          return (
            <button
              key={node.name}
              className={"flow-node" + (isOpen ? " active" : "")}
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              aria-expanded={isOpen}
            >
              <span className="flow-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="flow-body">
                <span className="flow-name">
                  {node.name}
                  <span className="flow-tag">{node.tag}</span>
                </span>
                <p className="flow-summary">{node.summary}</p>
                {isOpen && <div className="flow-detail">{node.detail}</div>}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
