# 3-Layer Automation Architecture

A structured architecture designed to separate **intent, decision-making, and execution** to build reliable, scalable automation systems.

This model ensures that workflows remain **organized, testable, and resilient** while minimizing errors caused by manual processes.

---

# Overview

The system operates using **three distinct layers**, each with a specific responsibility:

| Layer             | Purpose                               | Location           |
| ----------------- | ------------------------------------- | ------------------ |
| **Directive**     | Defines what needs to be done         | `directives/`      |
| **Orchestration** | Decides how and when to execute tasks | Agent / Controller |
| **Execution**     | Performs the actual work via scripts  | `execution/`       |

This separation improves **maintainability, reliability, and scalability**.

---

# Architecture

## 1. Directive Layer — *What to Do*

The **Directive Layer** contains Standard Operating Procedures (SOPs) written in Markdown.

These documents describe tasks in clear natural language, similar to instructions given to a mid-level employee.

Directives should define:

* Objectives
* Inputs
* Required tools or scripts
* Expected outputs
* Edge cases and constraints

**Location**

```
directives/
```

Example responsibilities:

* Define workflows
* Document operational logic
* Capture improvements discovered during execution

Directives are **living documents** and must evolve as the system learns.

---

## 2. Orchestration Layer — *Decision Making*

The **Orchestration Layer** interprets directives and coordinates execution.

This layer is responsible for:

* Reading directives
* Selecting the appropriate tools
* Executing tasks in the correct sequence
* Handling failures
* Requesting clarification when required

Think of this layer as the **bridge between human intent and automated execution**.

Example responsibilities:

* Intelligent routing
* Error handling
* Workflow coordination
* System optimization

---

## 3. Execution Layer — *Doing the Work*

The **Execution Layer** contains deterministic scripts that perform actual operations.

Typical tasks handled by execution scripts:

* API calls
* Data processing
* File operations
* Database interactions
* Automation tasks

**Location**

```
execution/
```

Execution scripts should be:

* Deterministic
* Reliable
* Fast
* Testable

Manual operations should always be replaced with scripts whenever possible.

---

# Operating Principles

## 1. Check Existing Tools First

Before creating new scripts:

1. Review existing scripts inside `execution/`
2. Reuse existing tools whenever possible
3. Only build new scripts when necessary

This prevents duplication and maintains a clean toolset.

---

## 2. Self-Annealing When Failures Occur

Failures are treated as **learning opportunities**.

When something breaks:

1. Read the error message or stack trace
2. Identify the root cause
3. Fix the script
4. Test the fix
5. Update the directive with the new knowledge

Example scenario:

```
API rate limit encountered
↓
Investigate API documentation
↓
Implement request batching
↓
Update directive with improved process
```

Over time, this process makes the system **more robust and resilient**.

---

## 3. Continuously Improve Directives

Directives should be updated whenever new information is discovered, including:

* API limitations
* Better workflow strategies
* Performance improvements
* Edge cases

This ensures the system **continuously improves over time**.

---

# Self-Annealing Loop

The system follows a continuous improvement cycle:

```
Error occurs
      ↓
Fix the issue
      ↓
Improve the tool
      ↓
Test the solution
      ↓
Update the directive
      ↓
System becomes stronger
```

---

# File Organization

## Deliverables vs Intermediate Files

### Deliverables

Final outputs produced by the system.

Examples:

* Google Sheets
* Google Slides
* Cloud-hosted documents
* Reports

Deliverables should always live in **cloud systems**, not locally.

---

### Intermediate Files

Temporary files generated during processing.

Examples:

* Scraped datasets
* Temporary exports
* Working files

These files are stored locally and removed when no longer needed.

---

# Directory Structure

```
project-root/

├── .tmp/
│   Intermediate processing files
│   (scraped data, temp exports, working datasets)

├── execution/
│   Deterministic Python scripts
│   Automation tools

├── directives/
│   Markdown SOPs
│   Workflow instructions

├── .env
│   Environment variables
│   API keys and configuration

├── credentials.json
├── token.json
│   Google OAuth authentication files
```

---

# Key Principle

Local files exist **only for processing**.

All **final deliverables should live in cloud systems** to ensure accessibility and persistence.

---

# Summary

This architecture separates responsibilities into three layers:

| Layer         | Responsibility       |
| ------------- | -------------------- |
| Directive     | Define intent        |
| Orchestration | Coordinate execution |
| Execution     | Perform tasks        |

By maintaining this separation, the system becomes:

* More reliable
* Easier to maintain
* Easier to scale

---

# Core Philosophy

**Be pragmatic.**
**Be reliable.**
**Continuously improve the system.**
