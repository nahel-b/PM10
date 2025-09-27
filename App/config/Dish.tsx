

const dish = 
[
    {nom : "pizza",image : "pizza_1", image_alt : "default"},
    {nom : "burger",image : "pizza_1", image_alt : "default"},
    {nom : "pasta",image : "pizza_1", image_alt : "default"},
    {nom : "sushi",image : "pizza_1", image_alt : "default"},
    {nom : "salad",image : "pizza_1", image_alt : "default"},
    {nom : "poulet au curry", image : "poulet_curry_1", image_alt : "poulet_1"}
]

const ingredient = 
[
    {nom : "avocat", image : "avocat_1", image_alt : "default"},
    {nom : "oignon", image : "oignon_1", image_alt : "default"},
    {nom : "poivron", image : "poivron_1", image_alt : "default"}

]


const review_principale = 

{
    plat : "pizza",
    prix : 5.5,
    rating : 4.5,
    calage : 3,
    vegetarien : true,
    halal : true,
    piquant : true,
    ingredient : ["avocat","oignon","poivron"],
    nb_review : 5

}


const review = 
[
    {
        plat : "pizza",
        prix : 5.5,
        commentaire : "Delicious pizza with fresh ingredients",
        rating : 4.5,
        calage : 3,
        vegetarien : true,
        halal : true,
        piquant : true,
        ingredient : ["avocat","oignon","poivron"]
    }
]


export {dish, ingredient, review_principale, review};