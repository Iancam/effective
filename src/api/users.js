import * as postgrest from './postgrest';

export const getUsersReq = () => {
  return postgrest
    .getJSON('/users?select=username')
    .then(usersArray => {
      console.log(usersArray);

      const usersObject = {};
      for (var i = 0; i < usersArray.length; i++) {
        usersObject[usersArray[i].username] = usersArray[i];
        usersObject[usersArray[i].username].suggestionName =
          usersArray[i].username;
      }
      return usersObject;
    })
    .catch(err => console.log('Error fetching users:', err));
};

export const postUsersReq = user => {
  return postgrest
    .postJSON('/users', user, { Prefer: 'return=representation' })
    .then(userJSON => userJSON[0])
    .catch(err => console.log('Error posting pursuance:', err));

  return postgrest
    .getJSON('/users?select=username')
    .then(usersArray => {
      console.log(usersArray);

      const usersObject = {};
      for (var i = 0; i < usersArray.length; i++) {
        usersObject[usersArray[i].username] = usersArray[i];
        usersObject[usersArray[i].username].suggestionName =
          usersArray[i].username;
      }
      return usersObject;
    })
    .catch(err => console.log('Error fetching users:', err));
};
