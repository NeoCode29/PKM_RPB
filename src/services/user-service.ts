"use server"

import { supabaseServer } from "@/lib/supabase/server"

export interface Users {
    id: string
    username: string
    email: string
    role: string
    created_at: string
}

export interface GetUsersParams {
    page: number
    pageSize: number
    search?: string
    sortBy?: "username" | "email" | "role"
    sortOrder?: "asc" | "desc"
}

export interface GetUsersResponse {
    data: Users[]
    count: number
}

export async function getUsers({
    page,
    pageSize,
    search = "",
    sortBy = "username",
    sortOrder = "asc",
}: GetUsersParams): Promise<GetUsersResponse> {
    const supabase = await supabaseServer()

    let query = supabase
        .from("users")
        .select("*", { count: "exact" })

    if (search) {
        query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`)
    }

    query = query
        .order(sortBy, { ascending: sortOrder === "asc" })
        .range((page - 1) * pageSize, page * pageSize - 1)

    const { data, error, count } = await query

    if (error) {
        throw error
    }

    return {
        data: data || [],
        count: count || 0,
    }
}

export async function getUserById(id: string): Promise<Users> {
    const supabase = await supabaseServer()
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single()

    if (error) {
        throw error
    }

    return data
}

export async function updateUser(id: string, updates: Partial<Users>): Promise<Users> {
    const supabase = await supabaseServer()
    const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

    if (error) {
        throw error
    }

    return data
}

export async function getReviewers(): Promise<Users[]> {
    const supabase = await supabaseServer()
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "reviewer")

    if (error) {
        throw error
    }

    return data || []
}


