{ pkgs, ... }: {
  channel = "unstable";

  packages = [
    pkgs.openssh
    pkgs.nano
    pkgs.deno
    pkgs.nodejs_22
  ];

  env = {};

  idx = {
    extensions = [
      "EditorConfig.EditorConfig"
      "foxundermoon.shell-format"
      "mhutchie.git-graph"
      "denoland.vscode-deno"
    ];

    previews = {
      enable = true;
      previews = {
        #web = {
        #  command = ["deno" "task" "serve"];
        #  manager = "web";
        #  env = {
        #    PORT = "$PORT";
        #  };
        #};
      };
    };

    workspace = {
      onCreate = {
        deno-install = "deno install";
      };
      onStart = {
        deno-task-check = "deno task check";
      };
    };
  };
}
