---
name: create-chatgpt-ai-workflows
description: Learn to create custom AI agents and workflows using ChatGPT's Agent Builder to automate complex tasks, integrate with third-party applications, and leverage various AI models and tools.
---

# Create AI Agents and Workflows with ChatGPT Agent Builder

Design and deploy custom AI agents capable of performing complex tasks, from generating content to integrating with external services. This skill demonstrates how to leverage templates, upload knowledge bases, and connect to hundreds of third-party applications to build powerful automation.

## Prerequisites

-   ChatGPT Plus subscription (required for Agent Builder access).
-   Access to a computer with internet and a web browser.
-   (Optional) Rube.app account for third-party integrations.

## Procedure

### Step 1: Access the Agent Builder
**Objective:** Navigate to the Agent Builder interface within ChatGPT to begin creating a new workflow.

**Instructions:**
1.  Go to https://platform.openai.com/chat
2.  In the left sidebar, locate and click on "Agent Builder".
3.  If starting a new project, select `new project` from the project dropdown if not already selected.
4.  To create a new workflow, click the "+ Create" button under "Create a workflow".

### Step 2: Configure a YouTube Script Writer Agent
**Objective:** Define a standalone agent with specific instructions and provide it with contextual content.

**Instructions:**
1.  Drag an "Agent" node from the "Core" section in the left sidebar onto the canvas and connect it to the "Start" node.
2.  Select the "Agent" node and name it (e.g., "YouTube Script Writer").
3.  In the "Instructions" field, define the agent's role and task.
    -   Example: "I want you to be a YouTube expert script writer that builds me scripts based on the scripts from my past successful videos. Every single response should make a video script that is 10-12 minutes long."
4.  Optionally, toggle "Include chat history" if the agent requires context from previous interactions.
5.  Select the desired "Model" (e.g., `gpt-4.5-turbo`).
6.  Adjust "Reasoning effort" (e.g., `Low`, `Medium`, `High`).
7.  Choose "Output format" (e.g., `Text`, `JSON`).
8.  To provide the agent with specific knowledge, click the "+" icon next to "Tools".
9.  Select "File search" from the dropdown.
10. In the "Attach files to file search" pop-up, click "Upload" or drag-and-drop a PDF file (e.g., "Script Outlines 1-3(3).pdf") containing relevant information.
11. Click "Attach" to link the file to the agent.
12. Click "Preview" in the top right corner to test the workflow.
13. Send a message to the agent (e.g., "Title: YouTube Algorithm Update September 2025") to initiate the script generation.

**Verification:**
-   The agent processes the input and starts "Searching for script examples" and "Searching files".
-   The agent begins "Planning the YouTube Script" and generates a script based on the provided outline and previous content.

### Step 3: Implement an Internal Knowledge Assistant (AI Brain Template)
**Objective:** Create a workflow to triage and answer employee questions based on internal knowledge.

**Instructions:**
1.  Return to the "Agent Builder" main screen.
2.  Click on the "Templates" tab.
3.  Locate and select the "Internal knowledge assistant" template.
4.  Observe the pre-built workflow for question handling:
    -   **Start**: Initiates the process.
    -   **Query rewrite agent**: Rewrites the user's question for clarity.
    -   **Classify agent**: Categorizes the question.
    -   **Condition (If/Else)**: Directs the question to appropriate sub-workflows based on classification (e.g., Q&A, Fact finding, Else).
    -   **Internal Q&A Agent**: Answers internal questions using available knowledge.
    -   **External Fact Finding Agent**: Searches external sources for answers.
    -   **Agent (Fallback)**: A general agent for unclassified questions.
5.  To customize an agent within this workflow (e.g., "Internal Q&A"), click on it.
6.  Edit its "Instructions" to specify how it should answer: "Answer the user's question using the knowledge tools you have on hand (file or web search). Be concise and answer succinctly, using bullet points and summarize the answer up front."
7.  Enable or disable specific "Tools" (e.g., "Web search", "File search") for the agent.

**Verification:**
-   The workflow correctly routes different types of questions to specialized agents.
-   Agents provide concise and accurate answers based on their assigned knowledge sources and tools.

### Step 4: Build a Customer Service Bot (Customer Service Template)
**Objective:** Automate customer queries with custom policies and provide specific responses like refunds or information.

**Instructions:**
1.  Return to the "Agent Builder" main screen and select the "Templates" tab.
2.  Choose the "Customer service" template.
3.  Examine the workflow designed to handle customer interactions:
    -   **Start**: Begins the customer interaction.
    -   **Jailbreak guardrail**: Determines if user input is reasonable and safe.
    -   **Classification agent**: Identifies the user's intent (e.g., return item, cancel subscription, get information).
    -   **Condition**: Routes to different agents based on the classified intent.
    -   **Return agent**: Handles return requests.
    -   **Retention agent**: Addresses cancellation inquiries, aiming to retain the customer.
    -   **Information agent**: Provides general information.
    -   **User approval**: Requires human intervention for sensitive actions.
    -   **End**: Concludes the workflow.
4.  To enhance functionality and connect to external services (e.g., to process refunds), select an agent (e.g., "Return agent").
5.  Click the "+" icon next to "Tools".
6.  Select "MCP server" (Managed Connect Platform server).
7.  Click the "+ Server" button.
8.  Enter the "MCP URL" (e.g., `https://rube.app/mcp`).
9.  Provide a "Label" (e.g., `rube_mcp`) and optional "Description" for the server connection.
10. Choose "Access token / API Key" for authentication, or select "None" if not required.
11. Click "Connect" to establish the connection.
12. Once connected, select specific third-party tools from the list (e.g., Zapier, Shopify, Intercom, Stripe, Plaid, Square, Cloudflare Browser, HubSpot, Pipestream, PayPal, DeepWiki, Zendesk, Calendly) to give the agent access to specific actions (e.g., issuing refunds via PayPal/Stripe, checking order status via Shopify).

**Verification:**
-   The customer service bot effectively triages inquiries.
-   Agents perform specific actions (e.g., offer replacements, issue refunds) by leveraging connected third-party tools.
-   User approval steps trigger for sensitive operations.

### Step 5: Leverage Data Enrichment (Data Enrichment Template)
**Objective:** Research companies, summarize information, and convert data into structured formats.

**Instructions:**
1.  Go back to the "Agent Builder" main screen and choose the "Templates" tab.
2.  Select the "Data enrichment" template.
3.  Observe the workflow:
    -   **Start**: Initiates the data enrichment process.
    -   **Web research agent**: Finds company information using web search.
    -   **Summarize and display agent**: Summarizes the research for the user.
    -   (Alternatively, a path to convert results to structured data is also shown conceptually).
4.  To customize the "Web research agent", click on it.
5.  Edit its "Instructions" (e.g., "You're a helpful assistant. Use web search to find information about the following company. You can use marketing research based on the underlying topic.").
6.  Configure "Output format" (e.g., `JSON`) and potentially attach a "company_info_marketing_batch" file for context.

**Verification:**
-   The agent performs web searches for company information.
-   It then summarizes the findings or converts them into a structured data format.

## Troubleshooting

### Issue: Templates not visible
**Solution:** Ensure you are in a "New project". If you are in a "Default project", templates might not show due to a potential UI glitch. Create a new project to access them.

### Issue: Limited tool integrations
**Solution:** Utilize Rube.app to connect your ChatGPT agents to over 800 third-party applications, providing access to more than 50,000 actions. This expands the capabilities beyond the native OpenAI connectors.

## Success Criteria
-   [ ] Successfully navigated to the Agent Builder and initiated a new workflow.
-   [ ] Created or customized an AI agent with specific instructions and attached relevant files.
-   [ ] Integrated a third-party service via Rube.app to extend agent capabilities (e.g., processing refunds, scheduling appointments).
-   [ ] Tested a custom workflow to ensure agents perform intended actions (e.g., generating content, answering questions, managing customer interactions).

## Additional Notes
-   The Agent Builder allows for high customization, enabling users to create niche agents for specific tasks like analyzing real estate deals, managing taxes, or handling financial queries.
-   The ability to integrate with third-party apps like Salesforce, Shopify, Zendesk, and PayPal via Rube.app makes the AI agents significantly more powerful and capable of automating complex business processes.
-   This approach drastically reduces the manual effort required for various tasks, potentially turning "upset customers into happy and raving customers" by efficiently resolving their queries.