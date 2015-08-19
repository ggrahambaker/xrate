{
  "targets": [
    {
      "target_name": "xrateplus",
      "sources": [ "xrate.cc", "util.cc"],
      "include_dirs" : [
        "<!(node -e \"require('nan')\")"
      ]
    }
  ]
}
