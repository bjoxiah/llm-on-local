# LLM On Local Chat Demo

A simple demo to showcase how to run open-source large language models locally using Ollama.

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running on your machine  
- Basic familiarity with Docker commands  
- (Optional) [Ollama CLI](https://ollama.com/docs) if you want to interact with the models directly outside this demo  

---

## How to Run

1. **Build the Docker images**  
   From the root folder, open your terminal and run:  
   ```bash
   docker compose build --no-cache
   ````

2. **Start the application**
   Launch the app by running:

   ```bash
   docker compose up
   ```
  
   **Note:** This might take a while because the Ollama runtime is ~2.7 GB, and it also needs additional time to pull in the LLM model.


3. **Stop the application and clean up**
   When finished, stop all containers and remove associated volumes and orphan containers with:

   ```bash
   docker compose down --volumes --remove-orphans
   ```

---

## Usage

* Once the application is running, access the chat interface at:

  ```
  http://localhost:3000
  ```

  Your can replace the port in the docker compose file, it is currently set to `3000`

* Interact with the large language model, for this demo we're using `(qwen)` through the web interface or API endpoints exposed by the app.

---

## Troubleshooting

* **Docker daemon not running?**
  Ensure Docker Desktop or the Docker service is running on your machine.

* **Port conflicts?**
  Verify the port configured in your Docker Compose file is not being used by another application. Change it if necessary.

* **Slow builds or build failures?**
  Try clearing Docker cache manually or increase the resources allocated to Docker.

* **Models not loading correctly?**
  Confirm that Ollama is properly installed and configured if your setup requires it outside of Docker.

---

Feel free to open an issue if you encounter any other problems or have suggestions!


