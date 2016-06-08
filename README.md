## Rename article field encoded_url to slug
 `db.articles.update({}, {$rename:{'encoded_url':'slug'}});`