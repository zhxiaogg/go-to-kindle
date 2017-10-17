# send to kindle

convert a url to pdf and send it to your mailbox(eg. kindle), runs on aliyun function computing.

## requirements
- runs on aliyun function computing
- using [puppeteer](https://github.com/GoogleChrome/puppeteer) to convert url into pdf
- *requires a hand build headless chrome binary*
- *requires a hand build libnss3 library*

## deploy to aliyun

1. create production config

  - create a file named `prod.json` in the project's `config` dir.
  - copy `default.json` content (only those need to change) to `prod.json` and change the settings, eg. mail options

2. build headless chrome and other libraries

  TODO: doc on building or downloading headless_shell (custom build chrome) and libnss3

3. deploy to aliyun

  run following scripts:
  ```shell
  ➜cd send-to-kindle
  ➜npm install
  ➜fcli shell
  >>>mks send-to-kindle -d "send to kindle functions"
  >>>mkf send-to-kindle/send -h index.send --runtime nodejs6 -d ./
  ```
