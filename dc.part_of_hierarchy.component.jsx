const property = "part_of";
var childDepth = 12;
function return_children(parent_object) {
  const parent_name = parent_object.value("$name");
  const parent_id = parent_object.value("$id");

  let children = "";
  if (parent_object.value("$typename") == "Section") {
    // construct internal link for heading
    const filepath_section = parent_object.value("$file"); // find the filepath of note with heading
    const match = filepath_section.match(/([^\/]+)\.md$/); // regex match, after last "/" and for ".md"
    const file_name = match ? match[1] : null; // extracts the matched value if it exists, otherwise sets result to null.
    children = dc
      .useQuery(
        `(@section OR @page) and contains(${property}, [[${file_name}#${parent_name}]])`
      )
      .filter((child) => child.value("$id") !== parent_id);
  } else {
    children = dc
      .useQuery(
        `(@section OR @page) and contains(${property}, [[${parent_name}]])`
      )
      .filter((child) => child.value("$id") !== parent_id);
  }
  // Add the children_property to the parent_object
  parent_object.$children_property = children.map((child) =>
    return_children(child)
  );
  return parent_object;
}

function PartOfHierarchy() {
  const note = dc.useCurrentFile();
  // custom childDepth
  if (Object.keys(note.value("$frontmatter")).includes("child_depth")) {
    childDepth = note.value("child_depth");
  } else {
  }
  // apply childrens based on property
  const rootNode = return_children(note);
  const list_children = rootNode.value("$children_property");

  // render list
  return (
    <dc.List
      rows={list_children}
      childSource={"$children_property"}
      renderer={(child) => child.$link}
      maxChildDepth={childDepth}
    />
  );
}

return { PartOfHierarchy };
