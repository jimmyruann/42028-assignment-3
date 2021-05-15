# Requirement

Python 3, Node >= 14

# Installation

Install `python3-opencv`, FFMPEG

`sudo apt update && sudo apt install python3-opencv ffmpeg`

Install NodeJS

`curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs`

Install `yarn`

`sudo npm install yarn -g`

Install packages for frontend and backend

`yarn run install-packages`

Install packages Python

`pip install -r cnn/requirements.txt`

# Build / Compile

Build Frontend and Backend

`yarn run build`

# Start server

`yarn start`

# Models can be download from Google Drive

### InceptionV3, ResNetV2, VGG16

# Download from google drive

`wget --load-cookies /tmp/cookies.txt "https://docs.google.com/uc?export=download&confirm=$(wget --quiet --save-cookies /tmp/cookies.txt --keep-session-cookies --no-check-certificate 'https://docs.google.com/uc?export=download&id=1odR9b3Itj26Vv8WMdwy7m_duF0Tt_BYY' -O- | sed -rn 's/.*confirm=([0-9A-Za-z_]+).*/\1\n/p')&id=1odR9b3Itj26Vv8WMdwy7m_duF0Tt_BYY" -O models.zip && rm -rf /tmp/cookies.txt`
