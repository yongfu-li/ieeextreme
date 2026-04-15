#include <algorithm>
#include <deque>
#include <functional>
#include <iostream>
#include <numeric>
#include <queue>
#include <random>
#include <utility>
#include <vector>
using namespace std;

static bool guaranteed(int n, const vector<pair<int,int>>& edges, const vector<int>& seq){
    vector<int> adj(n,0);
    for(auto [u,v]:edges){adj[u]|=1<<v;adj[v]|=1<<u;}
    int S=(1<<n)-1;
    for(int v:seq){
        int S2=S&~(1<<v),T=0,x=S2;
        while(x){int b=x&-x;int i=__builtin_ctz((unsigned)b);x-=b;T|=adj[i];}
        S=T;
    }
    return S==0;
}

static vector<int> peel_seq(int n, const vector<pair<int,int>>& edges){
    vector<vector<int>> g(n);
    for(auto [u,v]:edges){g[u].push_back(v);g[v].push_back(u);}
    vector<int> deg(n);for(int i=0;i<n;i++)deg[i]=g[i].size();
    vector<int> alive(n,1),seq; seq.reserve(n);
    deque<int> q;
    for(int i=0;i<n;i++) if(deg[i]==1) q.push_back(i);
    int alive_cnt=n;
    while(alive_cnt>1 && !q.empty()){
        int u=q.front();q.pop_front();
        if(!alive[u]||deg[u]!=1) continue;
        int p=-1; for(int v:g[u]) if(alive[v]) {p=v;break;}
        if(p==-1) continue;
        seq.push_back(p);
        alive[u]=0; --alive_cnt;
        --deg[p];
        if(deg[p]==1) q.push_back(p);
    }
    return seq;
}

int main(){
    mt19937 rng(1);
    for(int n=2;n<=12;n++){
        int fail1=0,fail2=0,fail3=0,fail4=0,fail5=0;
        for(int it=0;it<5000;it++){
            vector<pair<int,int>> edges;
            for(int i=1;i<n;i++){int p=uniform_int_distribution<int>(0,i-1)(rng);edges.push_back({i,p});}
            auto s=peel_seq(n,edges);
            auto s2=s; s.insert(s.end(),s2.begin(),s2.end());
            auto r=s2; reverse(r.begin(),r.end());
            vector<int> a=s2; a.insert(a.end(),r.begin(),r.end());
            vector<int> b=s2; b.insert(b.end(),s2.begin(),s2.end()); b.insert(b.end(),r.begin(),r.end());

            vector<vector<int>> g(n);
            for(auto [u,v]:edges){g[u].push_back(v);g[v].push_back(u);}
            vector<int> post;
            function<void(int,int)> dfs=[&](int u,int p){
                for(int v:g[u]) if(v!=p){ dfs(v,u); post.push_back(u); }
            };
            dfs(0,-1);
            post.push_back(0);

            vector<int> rec;
            function<void(int,int)> dfs2=[&](int u,int p){
                for(int v:g[u]) if(v!=p){
                    rec.push_back(u);
                    dfs2(v,u);
                    rec.push_back(u);
                }
            };
            dfs2(0,-1);
            rec.push_back(0);

            if(!guaranteed(n,edges,s)) fail1++;
            if(!guaranteed(n,edges,a)) fail2++;
            if(!guaranteed(n,edges,b)) fail3++;
            if(!guaranteed(n,edges,post)) fail4++;
            if(!guaranteed(n,edges,rec)) fail5++;
        }
        cout<<"n="<<n<<" fail_s="<<fail1<<" fail_sr="<<fail2<<" fail_ssr="<<fail3<<" fail_post="<<fail4<<" fail_rec="<<fail5<<"\n";
    }
}
