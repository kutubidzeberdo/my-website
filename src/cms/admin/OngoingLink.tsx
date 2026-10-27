'use client';
import Link from 'next/link';
export function OngoingLink(){return <Link className="nav__link" href={'/admin/collections/projects?where[status][equals]=ongoing'}>პროექტები განხორციელების პროცესში</Link>;}
