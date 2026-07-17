# KiroAware System Context Specification

## Purpose
Define how KiroAware captures, verifies, and surfaces system context to Kiro IDE.

## Architecture Layers

### Layer 1: Auto-Detect (Ground Truth)
- Source: systeminformation library
- Data: CPU, memory, battery, disk, network, processes, OS
- Frequency: On-demand per tool call
- Trust: Absolute — direct hardware measurement

### Layer 2: User Report (Subjective)
- Source: User input via Kiro chat
- Data: States Kiro cannot detect (network feels slow, fan loud, limited time)
- Frequency: User-initiated
- Trust: Requires verification

### Layer 3: Verification Engine
- Cross-references Layer 2 against Layer 1
- Assigns confidence score (0.0–1.0)
- Flags temporal nature (temporary / persistent / recurring)
- Evidence must be traceable to auto-detect data

### Layer 4: Learning Engine
- Device fingerprinting (hardware signature)
- Pattern tracking across sessions
- Temporal decay for old reports
- Cross-device correlation

### Layer 5: Adaptation Engine
- Returns constraints + recommended actions
- Kiro adapts: code complexity, suggestion verbosity, break reminders
- Cross-device awareness: "You're on your laptop — keeping it light"

## Data Storage
All data stored in `~/.kiroaware/` — local only, no cloud, no external APIs.

## Privacy
- No data leaves the local machine
- No telemetry sent to external services
- User owns all data
