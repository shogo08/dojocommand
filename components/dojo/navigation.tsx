"use client";
import {Menu,Layers,FolderOpen} from 'lucide-react';
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem} from '@/components/ui/dropdown-menu';
export function StudioNavigation(){return <div className="profile-actions"><span className="avatar">SK</span><DropdownMenu><DropdownMenuTrigger asChild><button className="iconbtn" aria-label="Open navigation menu"><Menu size={19}/></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem asChild><a href="/"><Layers size={16}/>Command center</a></DropdownMenuItem><DropdownMenuItem asChild><a href="/created"><FolderOpen size={16}/>Created work</a></DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>}
