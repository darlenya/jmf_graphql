/**
 * Template for the GraphQL database
 */

 // -------------------------------
 // export classes
 // -------------------------------
 __EXPORT_CLASSES__


 // --------------------------
// helper
// --------------------------

// The current ID. This is the internal sequence
let id = 999;

// Stores all the elements by there ID
const ALL_ELEMENTS = {};

/**
 * Returns a new unique id
 * @protected
 * @returns {integer} A new id
 */
function _getNextId(){
  id++;
  return id;
}



// -------------------------------
// Datastores
// -------------------------------
// const <ObjectName>ById = {};

__DATA_STORES__

// -------------------------------
// Getter
// -------------------------------
// export function get<ObjectName>(id) {
//   return <ObjectName>ById[id];
// }

__GETTER_FUNCTIONS__


// -------------------------------
// Remove
// -------------------------------




let ___uniqueId = 1000;
/**
 * Creates a new unique id
 * @returns {integer} A new id value
 */
function ___getUniqueId(){
	___uniqueId++;
	return ___uniqueId;
}
