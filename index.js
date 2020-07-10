const mongoose = require("mongoose");

if (!process.env.production) require('./util/env.js');

//Connect to Database
mongoose.connect(`mongodb+srv://42_user:${process.env.db_pass}@main.wg2b2.mongodb.net/${process.env.db_name}?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true});

app = require('./app.js');

const port = process.env.PORT || 4999;
app.listen(port, () => console.log(`Server listening on port ${port}`));