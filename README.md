# LangChain in Supabase Edge Functions

Installing NPM Packages in Supabase Edge Functions
If you're familiar with Supabase Edge Functions, you may know that installing npm packages is not as straightforward as in a typical Node.js or Express application. However, there are several methods to include npm packages in Supabase Edge Functions. In this guide, I'll demonstrate how to use the import_map.json file to achieve this.

---

## Initialize & Start Supabase Project

> Ensure Docker is installed on your machine.

### Step 1: Initialize the Project

Choose your directory and run the following command:

```sh
npx supabase init
```

This will create a `supabase` folder in your directory.

### Step 2: Start the Supabase Project

Run the following command to start the project:

```sh
npx supabase start
```

This process may take a few minutes as it pulls Docker images and starts the containers.

### Step 3: Create a Supabase Edge Function

Open the directory in your favorite code editor and run the following command to create a new Supabase Edge Function:

```sh
npx supabase functions new <your-function-name>
```

This will create a folder with the name of your function inside the `functions` directory.

## Install NPM Packages

> You can install any npm package. For this example, we'll install LangChain packages to create a basic RAG pipeline.

### Step 4: Create `import_map.json`

Create a file named `import_map.json` in your `functions` folder and add the following JSON block:

```json
{
  "imports": {
    "@supabase/supabase-js": "npm:@supabase/supabase-js@2.43.1",
    "langchain/": "https://esm.sh/langchain@0.2.0/",
    "@langchain/openai/": "https://esm.sh/@langchain/openai@0.0.28/",
    "@langchain/core/": "https://esm.sh/@langchain/core@0.1.62/",
    "@langchain/community/": "https://esm.sh/@langchain/community@0.0.56/"
  }
}
```

### Important Instructions

> If you want to use submodules of an npm package, ensure you add a `/` at the end of the package name. For reference, see the import of `@supabase/supabase-js` and the remaining `langchain` packages.

## Deploy Your Edge Function to Production

> Ensure your project is linked with your Supabase cloud project.

To deploy your edge function to Supabase, run the following command:

```sh
npx supabase functions deploy
```

This command will deploy all functions.

To deploy a specific function, use:

```sh
npx supabase functions deploy <function-name>
```
