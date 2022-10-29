//base - Product.find({})
//bigQuery -?search=tshirt?page=2&category=shortSleeves?ratings[gte]=4&price[gte]=2000&price[lte]=5000&limit=5

class WhereClause {
  constructor(base, bigQuery) {
    this.base = base;
    this.bigQuery = bigQuery;
  }

  search() {
    const searchWord = this.bigQuery.search
      ? {
          name: {
            $regex: this.bigQuery.search,
            $options: "i", // i-> case insensitive check , g-> global
          },
        }
      : {};

    this.base = this.base.find({ ...searchWord });

    return this;
  }

  //First search(get all the products) , then limit the number of items displayed per page

  paginator(resultsPerPage) {
    let currentPage = 1;
    if (this.bigQuery.page) {
      //checking if it asks for paginated response
      currentPage = this.bigQuery.page;
    }

    const valuesToBeSkipped = resultsPerPage * (currentPage - 1);

    this.base = this.base.limit(resultsPerPage).skip(valuesToBeSkipped);
    return this;
  }

  //filters the products
  filter() {
    const query = { ...this.bigQuery }; //we don't want to modify the original query so spreading and copying it into query variable

    delete query["search"];
    delete query["limit"];
    delete query["page"];

    //query is an object . We need to convert it to a string to work with regexes
    let stringifiedQuery = JSON.stringify(query);

    const regexPattern = "/\b(gte|lte|gt|lt)\b/g"; //g-> global - replace all the matches

    stringifiedQuery = stringifiedQuery.replace(
      regexPattern,
      (matched) => `$${matched}`
    );

    const jsonOfStringifiedQuery = JSON.parse(stringifiedQuery);

    this.base = this.base.find(jsonOfStringifiedQuery);
    return this;
  }
}

module.exports = WhereClause;
