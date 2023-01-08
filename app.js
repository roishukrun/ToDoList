//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require("lodash");

const mongodbUserName = "roishukrun";
const mongodbPassword = "B4lFTQfY0tv1Jxrn";

const app = express();

app.set('view engine', 'ejs');

const dbName = "todolistDB";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set('strictQuery', false);

mongoose.connect(`mongodb+srv://${mongodbUserName}:${mongodbPassword}@todolist-cluster.cbpmeoe.mongodb.net/${dbName}?retryWrites=true&w=majority`, { useNewUrlParser: true }, function (err) {
  if (err) {
    console.log(err);
  }
});

// Connect to local database.
/* mongoose.connect(`mongodb://127.0.0.1:27017/${dbName}`, { useNewUrlParser: true }, function (err) {
  if (err) {
    console.log(err);
  }
}); */

const itemsSchema = {
  name: {
    type: String,
    required: true
  }
};

const Item = mongoose.model("Item", itemsSchema);

const clean = new Item({
  name: "Clean"
});

const workout = new Item({
  name: "Workout"
});

const shower = new Item({
  name: "Shower"
});

const defaultItems = [clean, workout, shower];

const listsSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listsSchema);

const homePageListTitle = "Today";

app.get("/", function (req, res) {
  res.redirect("/" + homePageListTitle);
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listTitle = req.body.listTitle;

  if (itemName) {
    const item = new Item({ name: itemName });

    List.findOne({ name: listTitle }, function (err, list) {
      if (err) {
        console.log(err);
      }
      else {
        list.items.push(item);
        list.save();
        res.redirect("/" + listTitle);
      }
    });
  }
  else {
    res.redirect("/" + listTitle);
  }
});

app.post("/delete", function (req, res) {
  const listTitle = req.body.listTitle;
  const itemId = req.body.itemId;

  List.findOneAndUpdate(
    { name: listTitle },
    { $pull: { items: { _id: itemId } } },
    function (err, list) {
      if (err) {
        console.log(err);
      }
      else {
        res.redirect("/" + listTitle);
      }
    }
  );
});

app.get("/:customListName", function (req, res) {
  const customListName = lodash.capitalize(req.params.customListName);
  createNewListAndRedirect(customListName, res);
});

const createNewListAndRedirect = function (listTitle, res) {
  List.findOne({ name: listTitle }, function (err, list) {
    if (err) {
      console.log(err);
    }
    else {
      if (list != null) {
        res.render("list", { listTitle: listTitle, newListItems: list.items });
      }
      else {
        const list = new List({
          name: listTitle,
          items: defaultItems
        });

        List.insertMany(list, function (err) {
          if (err) {
            console.log("err");
          }
        });

        res.redirect("/" + listTitle);
      }
    }
  });
};

app.listen(3000, function () {
  console.log("Server started on port 3000");
});