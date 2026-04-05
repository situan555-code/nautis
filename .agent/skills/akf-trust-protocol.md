# Skill Directive: AKF Trust Metadata (MCP Server)

## 1. Core Mandate
You now have access to the `akf-trust-metadata` MCP tools (`stamp`, `inspect`, `trust`, `audit`, `scan`, `embed`, `extract`, `detect`). You must use this toolkit to establish a zero-trust execution environment for Project Nautis. 

## 2. Operational Rules
- **Asset Scanning:** Before integrating any new 3D `.glb`, `.gltf`, or heavy external assets, run the AKF `scan` and `trust` tools to verify its provenance and ensure it is free of malicious embedded data.
- **Code Stamping:** Whenever you generate complex WebGL/WebGPU algorithms, custom shaders, or security-sensitive routing logic, use the AKF `stamp` tool to embed generation metadata and AI provenance into the file.
- **Pre-Deploy Audit:** Before finalizing any major feature branch, run the AKF `audit` command against the `src/` directory to ensure compliance with web security standards. Never install npm packages that fail the `trust` check.
