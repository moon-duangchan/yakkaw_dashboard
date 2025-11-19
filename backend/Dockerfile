FROM gcr.io/distroless/base-debian12:nonroot

WORKDIR /app

# Copy the pre-built Go binary. The project README notes `main` is generated via `go build`.
COPY --chown=nonroot:nonroot main /app/main

# Echo defaults to port 8080. Mirror it and ensure PORT is available for managed platforms.
ENV PORT=8080
ENV SERVER_PORT=8080
EXPOSE 8080

ENTRYPOINT ["/app/main"]
