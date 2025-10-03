const property = "form_of";
function return_children(parent_object) {
  const parent_name = parent_object.value("$name");
  let children = "";
  if (parent_object.value("$typename") == "Section") {
    // construct internal link for heading
    const filepath_section = parent_object.value("$file"); // find the filepath of note with heading
    const match = filepath_section.match(/([^\/]+)\.md$/); // regex match, after last "/" and for ".md"
    const file_name = match ? match[1] : null; // extracts the matched value if it exists, otherwise sets result to null.
    children = dc.useQuery(
      `(@section OR @page) and contains(${property}, [[${file_name}#${parent_name}]])`
    );
  } else {
    children = dc.useQuery(
      `(@section OR @page) and contains(${property}, [[${parent_name}]])`
    );
  }
  // Add the children_property to the parent_object
  parent_object.$children_property = children.map((child) =>
    return_children(child)
  );
  return parent_object;
}

function Children({ parent }) {
  // Get the appropriate path/link based on the object type
  const getLinkForParent = (parent) => {
    const typename = parent.value("$typename");

    if (typename === "Section") {
      // For sections, create a header link using $file and $name
      const filepath = parent.value("$file");
      const sectionName = parent.value("$name");
      if (filepath && sectionName) {
        return dc.headerLink(filepath, sectionName);
      }
    } else if (typename === "MarkdownPage" || parent.value("$path")) {
      // For pages, use $path
      const path = parent.value("$path");
      if (path && path.trim() !== "") {
        return dc.fileLink(path);
      }
    }

    return null; // Return null if we can't create a proper link
  };

  const link = getLinkForParent(parent);

  return (
    <>
      <li>
        {link ? (
          <dc.Link link={link} />
        ) : (
          <span>{parent.value("$name") || "Unknown item"}</span>
        )}
      </li>

      {parent.$children_property?.length > 0 && (
        <li>
          <ul>
            {parent.$children_property.map((child, index) => (
              <Children key={index} parent={child} />
            ))}
          </ul>
        </li>
      )}
    </>
  );
}

function FormOfHierarchy() {
  const note = dc.useCurrentFile();
  const rootNode = return_children(note);

  return (
    <ul>
      {rootNode.$children_property?.map((child, index) => (
        <Children key={index} parent={child} />
      ))}
    </ul>
  );
}

return { FormOfHierarchy };
