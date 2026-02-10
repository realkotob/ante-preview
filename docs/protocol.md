# Protocol Specification

Each Agent/Session is modeled similar to process with input queue and output queue.

## Core Concepts

`Project`
- corresponding to a git repo or a root directory
- can have multiple `Session`

`Session`
- respresent a episode of interaction between user and Ante
- where user send some Op to generate a `Task` to this session

`Task`
- Abstract concept of intent representing one piece of where user want to accomplish
- can take arbitrarily long to finish
- can be completed through multiple `Turn`

`Turn`
- one back and forth with agent
- start with user `Op`
- can end with agent message or request for approval
- can be completed with multiple `Step`

** Generally if there is not approval interruption, one Task is consist of one `Turn`

`Step`
- one interaction from Agent with LLM 
- handle tool calls and potentially other mechanics (guardrail, hooks, etc.)

`Op`
- Action that is initiated

`Evt`
- Events that can be from environment or effects of an `Op`

`Server`
- Sender of Evt and Receiver of Op

`Client`
- Sender of Op and Receiver of Evt


### Basic UI Flow

A single user input, followed by a 2-turn task

```mermaid
sequenceDiagram
  autonumber
  box "UI"
    participant User
  end
  box "Daemon"
    participant Core
    participant Session
    participant Task
  end
  box "LLM Provider"
    participant LLM
  end

  User->>Core: Op::ConfigureSession
  Core->>Session: Create session
  Core-->>User: Event::SessionInitialized

  User->>Session: Op::UserInput
  Session-->>+Task: Start task
  Task-->>User: Event::TaskStarted

  rect rgb(245,245,245)
    note over Task,LLM: Turn 1
    Task->>LLM: prompt
    LLM-->>Task: response (exec)
    Task-->>User: Event::ExecApprovalRequest
    User->>Task: Op::ExecApproval::Allow
    Task-->>User: Event::ExecStart
    Task->>Task: exec
    Task-->>User: Event::ExecStop
    Task-->>User: Event::TurnComplete
  end

  rect rgb(245,245,245)
    note over Task,LLM: Turn 2
    Task->>LLM: stdout
    LLM-->>Task: response (patch)
    Task->>Task: apply patch (auto-approved)
    Task->>LLM: success
    LLM-->>Task: response (msg + completed)
    Task-->>User: Event::AgentMessage
    Task-->>User: Event::TurnComplete
  end

  Task-->>-User: Event::TaskComplete
```

### Task Interrupt

Interrupting a task and continuing with additional user input.

```mermaid
sequenceDiagram
  autonumber
  box "UI"
    participant User
  end
  box "Daemon"
    participant Session
    participant Task1
    participant Task2
  end
  box "LLM Provider"
    participant LLM
  end

  User->>Session: Op::UserInput
  Session-->>+Task1: Start task
  Task1-->>User: Event::TaskStarted
  Task1->>LLM: prompt
  LLM-->>Task1: response (exec)
  Task1->>Task1: exec (auto-approved)
  Task1-->>User: Event::TurnComplete
  Task1->>LLM: stdout
  LLM-->>Task1: response (exec)
  Task1->>Task1: exec (auto-approved)
  User->>Task1: Op::Interrupt
  Task1-->>-User: Event::Error("interrupted")

  User->>Session: Op::UserInput w/ last_response_id
  Session-->>+Task2: Start task
  Task2-->>User: Event::TaskStarted
  Task2->>LLM: prompt + Task1 last_response_id
  LLM-->>Task2: response (exec)
  Task2->>Task2: exec (auto-approved)
  Task2-->>User: Event::TurnComplete
  Task2->>LLM: stdout
  LLM-->>Task2: msg + completed
  Task2-->>User: Event::AgentMessage
  Task2-->>User: Event::TurnComplete
  Task2-->>-User: Event::TaskCompleted
```
