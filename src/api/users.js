import * as postgrest from './postgrest';

export const getUsersReq = () => {
  return postgrest
    .getJSON('/users')
    .then(usersArray => {
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
  console.log(user);

  return postgrest
    .jsonReqFactory('POST')('/users', user, { Prefer: 'return=representation' })
    .then(resp => {
      console.log(resp);

      const json = resp.json();
      if (!resp.ok) {
        // this could probably be moved to the factory method, honestly.
        // handle the error!
        console.warn(json.message);
      }
      return json;
    })
    .then(userJSON => userJSON[0])
    .catch(err => console.log('Error posting user:', err));
};
