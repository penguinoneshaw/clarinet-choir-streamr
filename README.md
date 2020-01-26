# clarinet-choir-streamr
Overlays system used for streaming concerts.
This repo (depending on the branch) pushes straight to heroku.

# Developing
This project desperately needs refactoring so that it's less tightly coupled and significantly less awkward to keep both the clarinet choir and wind band branches. In the interim however, you can clone the project and do the usual node installation steps (`npm i` or `yarn install`).

You then need to set up a mongoDB instance (or use the production one) and create a `.env` file in the root directory which contains

```shell
MONGODB_URI="The uri of your mongoDB instance"
SETTINGS_ID="The id of an instance of a settings object in your database"
SECRET_KEY="The encryption key for passwords"
```

where the settings object has the structure defined in `models/settings.js`.
