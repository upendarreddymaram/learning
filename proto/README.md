# Protocol Buffers

gRPC service contracts between orchestrator and Go workers.

## Phase 6

Define `.proto` files here for:

- RepoWorker
- CIWorker
- Shared message types

```bash
# Example generation (Phase 6)
# protoc --go_out=. --go-grpc_out=. *.proto
```
