# Awesome Pakistan
> Curated list of Pakistani software organizations and indidual developers contributing in open source.

## Contents
<% for (i in awesome) { %> - [<%= awesome[i].type %>](#<%= awesome[i].type %>)
<% } %>

<% for (i in awesome) { %>
<h3><a name="<%= awesome[i].type %>"></a><%= awesome[i].type %></h3>

| Name | Github Profile | Technologies | Web |
| --- | --- | --- | --- |
<% for (j in awesome[i].profiles) { %>| <%= awesome[i].profiles[j].name %> | [@<%= awesome[i].profiles[j].github_user %>](<%= awesome[i].profiles[j].github_link %>) | <%= awesome[i].profiles[j].technologies.join(", ")%> |  [🌍](<%= awesome[i].profiles[j].web %>) | 
<% } %>
<% } %>

## Contribution
Please do not update `Readme.md` file, it is auto generated, Add your entry in [Json](https://github.com/hafizusman530/awesome-pakistani/blob/master/awesome-data.json) file and create PR with nice description.