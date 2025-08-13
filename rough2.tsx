// interface User{
//   type :'user';
//   name:string;
//   age:number;
//   occupation:string;
// }

// interface Admin{
//   type:'admin';
//   name:string;
//   age:number;
//   role:string;
// }

// type Person =User | Admin;

// type userCriteria = Partial <Omit<User, 'type'>>;
// type AdminCriteria = Partial<Omit<Admin, 'type'>>;

// function isuser(person: Person): person is User{
//   return person.type === 'user';
// }

// function isAdmin(person: Person):person is Admin{
//   return person.type === 'admin';
// }

// function filtersPerson(persons: Person[],personType: 'user',criteria:UserCriteria):User[];
// function filtersPerson(person: Person[],personType:'admin',criteria:AdminCriteria):Admin[];

// function filtersPerson(
//   persons:Person[],
//   personType: 'user'|'admin',
//   criteria : UserCriteria | AdminCriteria
// ):Person[]{
//   return persons
//   .filter((person)=> person.type === personType)
//   .filter((person)=>{
//     const keys=getObjectKeys(criteria);
//     return keys.every((key)=> person[key]===criteria[key]);
//   })
// }