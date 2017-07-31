Radical CLI
===========

Cli utility for various personal purposes. Unless you'd like to see how `@radic/console` can be implemented, you probably have no use for this.

```text
npm install -g @radic/cli
```


Overview
--------
```text
           
Radic CLI                                                                                  
---------                                                                                  
                                                                                                              
Usage:                                                                                                        
r <command>                                                                                                                                                  
                                                                                                                                                             
Arguments:                                                                                                                                                   
<command>             any of the listed commands  [string]                                                                                                   
                                                                                                                                                             
Groups:                                                                                                                                                    
auth         manage service authentication                                                                                                                      
git          local git operations & remote git services                                                                                                                                          
google       remote google services                                                                                                                                                   
jira         remote jira service
ssh          ssh connection helper                                                                                                                                                                                 

Commands:
info         general information                                                                                                                                                           
tree         show commands as tree structure                                                                                                                                                                       
pmove        file mover
                                                                                                                                                                                                                   
Global options:                                                                                                                                                                                                    
-q|--quiet             Disables all output                                  [boolean]                                                                                                                                                     
-C|--no-colors         Disables color output                                [boolean]                                                                                                                                                     
-h|--help              show help                                            [boolean]                                                                                                                                                     
-v|--verbose           increase verbosity (1:verbose|2:data|3:debug|4:sil   [count]                                                                                                                                                       
                       ly)                                                                        

error :: Missing required argument <command> 
```