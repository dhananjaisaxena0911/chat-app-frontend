// const users2 = [
//     { name: "Alice", age: 25, city: "New York" },
//     { name: "Bob", age: 30, city: "Chicago" },
//     { name: "Charlie", age: 35, city: "Los Angeles" },
//     { name: "David", age: 30, city: "New York" }
// ];

// function filterByCriteria<T>(arr:T[],criteria:Partial<T>):T[]{
//     return arr.filter(item=>{
//         const keys = Object.keys(criteria) as (keyof T)[];
//         return keys.every(key=> item[key]===criteria[key]);
//     });
// }

// function groupBy(array, getKey){
//     return array.reduce((result,item)=>{
//         const key= getKey(item);
//         if(!result[key]){
//             result[key]=[];
//         }
//         result[key].push(item);
//         return result;
//     },{})
// }


// function uniqueBy<T,K extends keyof any>(array:T[],getKey:(item:T)=> K):T[]{
//     const Seen= new Set<K>();
//     return array.filter(item=>{
//         const key=getKey(item);
//         if(Seen.has(key)) return false;
//         Seen.add(key);
//         return true;
//     })

// }

// function partition<T>(array:T[],predicate:(item:T)=>boolean):[T[],T[]]{
//     return array.reduce<T[],T[]>(
//         (result,item)=>{
//             result[predicate(item) ? 0 : 1].push(item);
//             return result;
//         }
//     )
// }